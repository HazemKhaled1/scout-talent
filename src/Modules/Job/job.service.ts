import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Job } from "./job.entity";
import { MoreThan, Repository } from "typeorm";
import { addJobDTO } from "./dto/addJob.dto";
import { UserService } from "../Users/user.service";
import { JobApplicant } from "./job_applicant.entity";
import { updateJobDTO } from "./dto/updateJob.dto";
import { CVService } from "../CV/cv.service";
import { CandidateStatus } from "src/Shared/Enums/candidateStatus.enum";
import { applyJobDTO } from "./dto/applyJob.dto";
import { Brackets } from "typeorm";
import { JobStatus, JobType, WorkMode } from "src/Shared/Enums/job.enum";
import { jobStatusDTO } from "./dto/statusJob.dto";
@Injectable()
export class JobServices {
  constructor(
    @InjectRepository(Job) private jobRepository: Repository<Job>,
    @InjectRepository(JobApplicant)
    private jobApplicantRepository: Repository<JobApplicant>,
    private userService: UserService,
    private cvService: CVService,
  ) {}

  /**
   * to add new job
   * @param dto title , description , status ,deelline , salaryMin
   * @param recruiterId
   * @returns messsage
   */
  public async Addjob(dto: addJobDTO, companyId: string) {
    const {
      title,
      description,
      status,
      skills,
      location,
      minSalary,
      maxSalary,
      requirements,
      type,
      workMode,
      responsibilities,
    } = dto;

    const user = await this.userService.findUser(companyId);

    if (!user) throw new BadRequestException("please try again");

    const Njob = this.jobRepository.create({
      title,
      description,
      location,
      minSalary,
      maxSalary,
      status,
      requirements,
      type,
      workMode,
      skills,
      responsibilities,
      company: user,
    });

    await this.jobRepository.save(Njob);

    return { message: "add job successful" };
  }

  /**
   * get all job
   * @returns all jobs
   */
  public async getAllJob() {
    const jobs = await this.jobRepository.find({
      where: {
        status: JobStatus.PUBLISHED,
      },
    });

    return jobs;
  }

  public async GetAllJobsByCompany(companyId: string, q?: JobStatus) {
    const company = await this.userService.findUser(companyId);

    if (!company) throw new BadRequestException("please try again");

    const jobs = this.jobRepository
      .createQueryBuilder("job")
      .where("job.companyId = :companyId", { companyId });

    if (q) {
      jobs.andWhere("job.status = :q", { q });
    }

    return await jobs.getMany();
  }

  public async GetAllJobsByCompanyApply(
    companyId: string,
    q?: string,
    status?: string,
  ) {
    const company = await this.userService.findUser(companyId);

    if (!company) throw new BadRequestException("please try again");

    const jobsApply = this.jobApplicantRepository
      .createQueryBuilder("jobApply")
      .leftJoinAndSelect("jobApply.job", "job")
      .where("job.companyId = :companyId", { companyId });

    if (q) {
      jobsApply.andWhere(
        new Brackets((qb) => {
          qb.where("LOWER(job.title) LIKE LOWER(:q)", {
            q: `%${q}%`,
          }).orWhere("LOWER(job.skills) LIKE LOWER(:q)", {
            q: `%${q}%`,
          });
        }),
      );
    }

    if (status) {
      jobsApply.andWhere("jobApply.status = :status", { status });
    }

    return await jobsApply.getMany();
  }

  /**
   * get job's id
   * @param id
   * @returns job
   */
  public async getJob(id: string) {
    const job = await this.jobRepository.findOne({ where: { id } });

    if (!job) {
      throw new BadRequestException("not found job");
    }
    return job;
  }

  public async updateJob(companyId: string, id: string, dto: updateJobDTO) {
    const job = await this.jobRepository.findOne({
      where: {
        id,
        company: {
          id: companyId,
        },
      },
    });

    if (!job) {
      throw new BadRequestException("not found job");
    }

    await this.jobRepository.update(id, dto);

    return { message: "Job updated successfully" };
  }

  /**
   * delete job
   * @param id
   * @returns message
   */
  public async deleteJob(companyId: string, id: string) {
    const job = await this.jobRepository.findOne({
      where: {
        id,
        company: {
          id: companyId,
        },
      },
    });

    if (!job) {
      throw new BadRequestException("not found job");
    }

    await this.jobRepository.remove(job);

    return { message: "Job deleted successfully" };
  }

  /**
   * application job
   * @param applicantId user
   * @param jobId job
   * @returns message
   */
  public async applyJob(
    applicantId: string,
    jobId: string,
    cvId: string,
    dto: applyJobDTO,
  ) {
    const user = await this.userService.findUser(applicantId);
    if (!user) throw new BadRequestException("please try again");

    const job = await this.jobRepository.findOne({ where: { id: jobId } });
    if (!job) throw new BadRequestException("please try again");

    const cv = await this.cvService.findCV(cvId);
    if (!cv) throw new BadRequestException("try again");

    const { about } = dto;

    const jobApp = this.jobApplicantRepository.create({
      applicant: user,
      job,
      cv,
      about,
    });

    await this.jobApplicantRepository.save(jobApp);

    return { message: "application the job successful" };
  }

  public async screeningCV(companyId: string, jobId: string, userId: string) {
    const jobApplicantion = await this.jobApplicantRepository.findOne({
      where: {
        job: {
          id: jobId,
          company: { id: companyId },
        },
        applicant: { id: userId },
      },
    });

    if (!jobApplicantion) throw new BadRequestException("please try again");

    jobApplicantion.status = CandidateStatus.SCREENING;
    await this.jobApplicantRepository.save(jobApplicantion);

    return { message: "convert cadidate status to screening successful" };
  }

  public async rejectCV(companyId: string, jobId: string, userId: string) {
    const jobApplicantion = await this.jobApplicantRepository.findOne({
      where: {
        job: {
          id: jobId,
          company: { id: companyId },
        },
        applicant: { id: userId },
      },
    });
    if (!jobApplicantion) throw new BadRequestException("please try again");

    jobApplicantion.status = CandidateStatus.REJECTED;
    await this.jobApplicantRepository.save(jobApplicantion);

    return { message: "convert cadidate status to rejected successful" };
  }

  public async hiredCV(companyId: string, jobId: string, userId: string) {
    const jobApplicantion = await this.jobApplicantRepository.findOne({
      where: {
        job: {
          id: jobId,
          company: { id: companyId },
        },
        applicant: { id: userId },
      },
    });
    if (!jobApplicantion) throw new BadRequestException("please try again");

    jobApplicantion.status = CandidateStatus.HIRED;
    jobApplicantion.hiredAt = new Date();

    await this.jobApplicantRepository.save(jobApplicantion);

    return { message: "convert cadidate status to hired successful" };
  }

  public async jobApplicantionByUser(
    userId: string,
    search?: string,
    location?: string,
    jobType?: JobType,
    workMode?: WorkMode,
  ) {
    const jobsApply = this.jobApplicantRepository
      .createQueryBuilder("jobApply")
      .leftJoinAndSelect("jobApply.job", "job")
      .leftJoinAndSelect("job.company", "company")
      .where("jobApply.applicant = :userId", { userId });

    if (search) {
      jobsApply.andWhere("LOWER(job.title) LIKE LOWER(:search)", {
        search: `%${search}%`,
      });
    }

    if (location) {
      jobsApply.andWhere("LOWER(job.location) LIKE LOWER(:location)", {
        location: `%${location}%`,
      });
    }

    if (jobType) {
      jobsApply.andWhere("LOWER(job.type) LIKE LOWER(:jobType)", {
        jobType: `%${jobType}%`,
      });
    }

    if (workMode) {
      jobsApply.andWhere("LOWER(job.workMode) LIKE LOWER(:workMode)", {
        workMode: `%${workMode}%`,
      });
    }

    return jobsApply.getMany();
  }

  public async jobApplicantionByUserByID(
    userId: string,
    jobApplyId: string
  ) {
    const jobApplyById = await this.jobApplicantRepository
    .createQueryBuilder("jobApply")
    .leftJoinAndSelect("jobApply.job", "job")
    .leftJoinAndSelect("job.company", "company")
    .where(
      "jobApply.id = :jobApplyId AND jobApply.applicant = :userId",
      { jobApplyId, userId }
    )
    .getOne();

    return jobApplyById;
  }

  public async dashboardStatisticsCompany(companyId: string) {
    const company = await this.userService.findUser(companyId);

    if (!company) throw new BadRequestException("no user found");

    const activeJobs = await this.jobRepository.count({
      where: {
        company: { id: companyId },
        createdAt: MoreThan(this.getDateBeforeMonths(3)),
        status: JobStatus.PUBLISHED,
      },
    });

    const totalCandidates = await this.jobApplicantRepository.count({
      where: {
        job: { company: { id: companyId } },
        createdAt: MoreThan(this.getDateBeforeMonths(3)),
      },
    });

    const lastJob = await this.jobRepository.findOne({
      where: {
        company: { id: companyId },
      },
      order: {
        createdAt: "DESC",
      },
    });

    const hiredApplicant = await this.jobApplicantRepository.findOne({
      where: {
        job: { id: lastJob?.id },
        status: CandidateStatus.HIRED,
      },
      order: {
        hiredAt: "ASC",
      },
    });

    let avgTimeToHireDays = 0;

    if (hiredApplicant && hiredApplicant.hiredAt && lastJob) {
      const MS_IN_DAY = 1000 * 60 * 60 * 24;

      avgTimeToHireDays = Math.floor(
        (hiredApplicant.hiredAt.getTime() - lastJob.createdAt.getTime()) /
          MS_IN_DAY,
      );
    }

    const offersSent = await this.jobApplicantRepository.count({
      where: {
        job: { company: { id: companyId } },
        createdAt: MoreThan(this.getDateBeforeMonths(3)),
        status: CandidateStatus.OFFERED,
      },
    });

    const hired = await this.jobApplicantRepository.count({
      where: {
        job: { company: { id: companyId } },
        createdAt: MoreThan(this.getDateBeforeMonths(3)),
        status: CandidateStatus.HIRED,
      },
    });

    return {
      activeJobs,
      totalCandidates,
      avgTimeToHireDays,
      offersSent,
      hired,
    };
  }

  public async ChangeJobStatus(
    companyId: string,
    jobId: string,
    dto: jobStatusDTO,
  ) {
    const job = await this.jobRepository.findOne({
      where: {
        id: jobId,
        company: { id: companyId },
      },
    });

    if (!job) throw new BadRequestException("no job found");

    const { status } = dto;
    job.status = status;

    await this.jobRepository.save(job);

    return job;
  }

  private getDateBeforeMonths(month: number) {
    const date = new Date();

    date.setMonth(date.getMonth() - month);

    return date;
  }
}
