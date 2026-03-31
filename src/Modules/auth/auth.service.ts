import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { User } from "../Users/user.entity";
import { DataSource, Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";

import { JwtService } from "@nestjs/jwt";
import { registerDTO } from "./dto/register.dto";
import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";
import { loginDTO } from "./dto/login.dto";
import { forgetPasswordDTO } from "./dto/forget_password.dto";
import { resetPasswordDTO } from "./dto/reset_password.dto";
import { StringValue } from "ms";
import { resendEmailVerify } from "./dto/resendEmailVerify.dto";
import { userRoleDTO } from "./dto/userRole.dto";
import { JwtPayloadType } from "src/Shared/types/JwtPayloadType";
import { RoleUser } from "src/Shared/Enums/user.enum";
import { generateToken } from "src/Shared/utils/generate.util";
import { mintesToMilliseconds } from "src/Shared/utils/cookie.util";
import { Outbox } from "../Users/outbox.entity";
import { EVENT_TYPE } from "src/Shared/Enums/outbox.enum";
import { UserToken } from "../Users/user-token.entity";
import { UserTokenType } from "src/Shared/Enums/UserToken.enum";
import { requestRestoreDTO } from "./dto/requestRestore.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserToken)
    private userTokenRepository: Repository<UserToken>,
    @InjectRepository(Outbox) private outboxRepository: Repository<Outbox>,
    private config: ConfigService,
    private jwtService: JwtService,
  ) {}

  /**
   * user register
   * @param dto name , email, password, role
   * @returns message
   */
  public async register(dto: registerDTO) {
    const {
      name,
      email,
      password,
      linkedIn_profile,
      phone,
      location,
      job_title,
      role,
    } = dto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (user) throw new BadRequestException("This email is already registered");

    const saltOrRounds = 10;
    const hash = await bcrypt.hash(password, saltOrRounds);

    const token = generateToken();

    const Suser = this.userRepository.create({
      name,
      email,
      password: hash,
      role,
      phone,
      linkedIn_profile,
      location,
      job_title,
    });

    await this.dataSource.transaction(async (manager) => {
      const nUser = await manager.save(Suser);

      const emailverify = manager.create(UserToken, {
        user: nUser,
        token,
        type: UserTokenType.VERIFY_EMAIL,
        expiresAt: new Date(Date.now() + mintesToMilliseconds(15)),
      });

      await manager.save(emailverify);

      const outbox = manager.create(Outbox, {
        event_type: EVENT_TYPE.SEND_VERIFICATION_EMAIL,
        payload: { email, token },
        nextRetryAt: new Date()
      });
      await manager.save(outbox);
    });

    return {
      message: "Verification email sent successfully. Please check your inbox.",
    };
  }

  /**
   * user login
   * @param dto email , password
   * @returns message
   */
  public async login(dto: loginDTO) {
    const { email, password, rememberMe } = dto;

    const fakeHash = "$2b$10$abcdefghijklmnopqrstuv1234567890";

    const user = await this.userRepository
      .createQueryBuilder("user")
      .addSelect("user.password")
      .where("user.email = :email", { email })
      .getOne();

    let isValid = false;

    if (user) {
      isValid = await bcrypt.compare(password, user.password);
    } else {
      await bcrypt.compare(password, fakeHash);
    }
    if (!user || !isValid)
      throw new UnauthorizedException("Invalid email or password");

    if (!user.isEmailVerified) {
      throw new BadRequestException(
        "Please verify your email before logging in",
      );
    }

    if (user.isDelete)
      throw new BadRequestException(
        "Account is deleted. Please restore it before continuing.",
      );

    const payload: JwtPayloadType = { id: user.id, role: user.role };

    const accessToken = await this.jwtService.signAsync(payload);

    const refreshExpires = rememberMe
      ? (this.config.get<string>("JWT_REFRESH_EXPIRES_IN") as StringValue)
      : (this.config.get<string>(
          "JWT_REFRESH_EXPIRES_IN_SHORT",
        ) as StringValue);

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>("JWT_Refresh_SECRET"),
      expiresIn: refreshExpires,
    });

    const HrefreshToken = await bcrypt.hash(refreshToken, 10);
    user.refreshToken = HrefreshToken;

    const Nuser = await this.userRepository.save(user);

    return {
      message: "login successful",
      accessToken,
      refreshToken,
      u: {
        id: Nuser.id,
        name: Nuser.name,
        role: Nuser.role,
      },
    };
  }

  public async resendEmailVerify(dto: resendEmailVerify) {
    const { email } = dto;

    const user = await this.userRepository.findOne({
      where:{email}
    })

    if (!user)
      throw new BadRequestException("No account found with this email");

    if (user.isEmailVerified)
      return {
        message: "Email is already verified",
      };
    const token = generateToken();

    await this.dataSource.transaction(async (manager) => {
      const emailverify = manager.create(UserToken, {
        user,
        token,
        type: UserTokenType.VERIFY_EMAIL,
        expiresAt: new Date(Date.now() + mintesToMilliseconds(15)),
      });

      await manager.save(emailverify);

      const outbox = manager.create(Outbox, {
        event_type: EVENT_TYPE.SEND_VERIFICATION_EMAIL,
        payload: { email, token },
      });
      await manager.save(outbox);
    });

    return {
      message: "Verification email sent successfully. Please check your inbox.",
    };
  }

  public async getAccessToken(refreshToken: string) {
    const payload: JwtPayloadType = await this.jwtService.verifyAsync(
      refreshToken,
      {
        secret: this.config.get<string>("JWT_Refresh_SECRET"),
      },
    );

    const user = await this.userRepository
      .createQueryBuilder("user")
      .addSelect("user.refreshToken")
      .where("user.id = :id", { id: payload.id })
      .getOne();

    if (!user || !user.refreshToken)
      throw new BadRequestException("Access denied");

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) throw new BadRequestException("Invalid refresh token");

    const newAccessToken = await this.jwtService.signAsync({
      id: user.id,
      role: user.role,
    });

    return { accessToken: newAccessToken };
  }

  public async logOut(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) throw new BadRequestException("not found user");

    user.refreshToken = "";
    await this.userRepository.save(user);

    return true;
  }

  public async requestRestore(dto: requestRestoreDTO) {
    const { email } = dto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (user && user.isDelete) {
      const token = generateToken();

      await this.dataSource.transaction(async (manager) => {
        const restore = manager.create(UserToken, {
          user,
          token,
          type: UserTokenType.RESTORE_ACCOUNT,
          expiresAt: new Date(Date.now() + mintesToMilliseconds(15)),
        });

        await manager.save(restore);

        const outbox = manager.create(Outbox, {
          event_type: EVENT_TYPE.SEND_RESTORE_EMAIL,
          payload: { email, token },
          nextRetryAt: new Date()
        });
        await manager.save(outbox);
      });
    }
    return { message: "If this email exists, we sent a reset link" };
  }

  public async confirmRestore(token: string) {
    const record = await this.userTokenRepository.findOne({
      where: { token, type: UserTokenType.RESTORE_ACCOUNT },
      relations: ["user"],
    });

    if (!record) {
      throw new BadRequestException("Invalid token");
    }

    if (record.expiresAt < new Date()) {
      throw new BadRequestException("Token expired");
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.update(User, record.user.id, { isDelete: false });

      await manager.delete(UserToken, record.id);
    });

    return { message: "restore Account successful" };
  }
  /**
   * to verify user's email
   * @param id user Id
   * @param verificationToken
   * @returns message
   */
  public async verifyEmail(token: string) {
    const record = await this.userTokenRepository.findOne({
      where: { token, type: UserTokenType.VERIFY_EMAIL },
      relations: ["user"],
    });

    if (!record) {
      throw new BadRequestException("Invalid token");
    }

    if (record.expiresAt < new Date()) {
      throw new BadRequestException("Token expired");
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.update(User, record.user.id, { isEmailVerified: true });

      await manager.delete(UserToken, record.id);
    });

    return { message: "your email has been verify , you can log in now" };
  }

  /**
   * user forget password
   * @param dto email
   * @returns message
   */
  public async forgetPassword(dto: forgetPasswordDTO) {
    const { email } = dto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (user) {
      const token = generateToken();

      await this.dataSource.transaction(async (manager) => {
        const resetPassword = manager.create(UserToken, {
          user,
          token,
          type: UserTokenType.RESET_PASSWORD,
          expiresAt: new Date(Date.now() + mintesToMilliseconds(15)),
        });

        await manager.save(resetPassword);

        const outbox = manager.create(Outbox, {
          event_type: EVENT_TYPE.SEND_RESET_PASSWORD,
          payload: { email, token },
          nextRetryAt: new Date()
        });
        await manager.save(outbox);
      });
    }
    return { message: "If this email exists, we sent a reset link" };
  }

  /**
   * update user's password
   * @param dto new password
   * @param id user id
   * @param resetPasswordToken
   * @returns message
   */
  public async resetPassword(dto: resetPasswordDTO, token: string) {
    const record = await this.userTokenRepository.findOne({
      where: { token, type: UserTokenType.RESET_PASSWORD },
      relations: ["user"],
    });

    if (!record) {
      throw new BadRequestException("Invalid token");
    }

    if (record.expiresAt < new Date()) {
      throw new BadRequestException("Token expired");
    }

    const { newPassword } = dto;
    const hashPassword = await bcrypt.hash(newPassword, 10);

    await this.dataSource.transaction(async (manager) => {
      await manager.update(User, record.user.id, { password: hashPassword });

      await manager.delete(UserToken, record.id);
    });

    return { message: "password update successful" };
  }

  public async GoogleAuth(email: string, name: string) {
    let user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      const password = randomBytes(12).toString("hex");

      const hash = await bcrypt.hash(password, 10);

      user = this.userRepository.create({
        name,
        email,
        password: hash,
        isEmailVerified: true,
        role: RoleUser.APPLICANT,
      });

      await this.userRepository.save(user);

      return {
        needRole: true,
        userId: user.id,
      };
    }
    const payload: JwtPayloadType = { id: user.id, role: user.role };

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>("JWT_Refresh_SECRET"),
      expiresIn: this.config.get<string>(
        "JWT_REFRESH_EXPIRES_IN",
      ) as StringValue,
    });

    const HrefreshToken = await bcrypt.hash(refreshToken, 10);

    user.refreshToken = HrefreshToken;
    user.isEmailVerified = true;

    await this.userRepository.save(user);

    return {
      needRole: false,
      token: { refreshToken },
    };
  }

  public async SelectRoleUser(dto: userRoleDTO, id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new BadRequestException("no user found , try again");

    const { role } = dto;

    const payload: JwtPayloadType = { id, role };

    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>("JWT_Refresh_SECRET"),
      expiresIn: this.config.get<string>(
        "JWT_REFRESH_EXPIRES_IN",
      ) as StringValue,
    });

    const HrefreshToken = await bcrypt.hash(refreshToken, 10);

    user.role = role;
    user.refreshToken = HrefreshToken;

    const Nuser = await this.userRepository.save(user);

    return {
      message: "login successful",
      accessToken,
      refreshToken,
      u: {
        id: Nuser.id,
        name: Nuser.name,
        role: Nuser.role,
      },
    };
  }

  public async getMe(refreshToken: string) {
    const payload: JwtPayloadType = await this.jwtService.verifyAsync(
      refreshToken,
      {
        secret: this.config.get<string>("JWT_Refresh_SECRET"),
      },
    );

    const user = await this.userRepository
      .createQueryBuilder("user")
      .addSelect("user.refreshToken")
      .where("user.id = :id", { id: payload.id })
      .getOne();

    if (!user || !user.refreshToken)
      throw new BadRequestException("Access denied");

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) throw new BadRequestException("Invalid refresh token");

    const newAccessToken = await this.jwtService.signAsync({
      id: user.id,
      role: user.role,
    });

    return {
      accessToken: newAccessToken,
      u: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    };
  }
}
