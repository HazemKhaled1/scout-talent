import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class MailService {
  constructor(private mailservice: MailerService) {}

  public async sendVerifyEmail(email: string, link: string) {
    await this.mailservice.sendMail({
      to: email,
      from: "sount talent",
      subject: "verify email",
      template: "verify_email",
      context: { link },
    });
  }
  public async sendResetPassword(email: string, link: string) {
    await this.mailservice.sendMail({
      to: email,
      from: "sount talent",
      subject: "Reset Password",
      template: "reset_password",
      context: { link },
    });
  }
}
