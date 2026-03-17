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
import { HiredDetails } from "./Hired_Details.entity";
import { HiredDTO } from "./dto/hired.dto";
import { RejectDTO } from "./dto/reject.dto";
import { Reject } from "./reject.entity";
import { InterviewDTO } from "./dto/interview.dto";
import { Interview } from "./interviews.entity";
import { JobOfferDTO } from "./dto/jobOffer.dto";
import { JobOffer } from "./jobOffer.entity";
@Injectable()
export class JobServices {
  constructor(
    @InjectRepository(Job) private jobRepository: Repository<Job>,
    @InjectRepository(JobApplicant)
    private jobApplicantRepository: Repository<JobApplicant>,
    @InjectRepository(HiredDetails)
    private hiredRepository: Repository<HiredDetails>,
    @InjectRepository(Reject) private rejectRepository: Repository<Reject>,
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    @InjectRepository(JobOffer)
    private jobOfferRepository: Repository<JobOffer>,
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

      .leftJoin("jobApply.job", "job")
      .leftJoin("jobApply.applicant", "applicant")

      .select([
        "jobApply.id",

        "job.id",
        "job.title",
        "job.skills",

        "applicant.id",
        "applicant.name",
        "applicant.job_title",
      ])

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

    return { jobaApply: await jobsApply.getMany() };
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
    const result = await this.jobRepository.delete({
      id,
      company: {
        id: companyId,
      },
    });

    if (result.affected === 0) {
      throw new BadRequestException("Job not found");
    }

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

  public async screeningCV(companyId: string, id: string) {
    const jobApplicantion = await this.jobApplicantRepository.findOne({
      where: {
        id,
        job: {
          company: { id: companyId },
        },
      },
    });

    if (!jobApplicantion) throw new BadRequestException("please try again");

    if (jobApplicantion.status === CandidateStatus.SCREENING) {
      throw new BadRequestException("status of candidate is already screening");
    }

    jobApplicantion.status = CandidateStatus.SCREENING;
    jobApplicantion.screenAt = new Date();
    const jobApp = await this.jobApplicantRepository.save(jobApplicantion);

    return {
      message: "convert candidate status to screening successful",
      jobApp: {
        id: jobApp.id,
        status: jobApp.status,
        screenAt: jobApp.screenAt,
      },
    };
  }

  public async rejectCV(companyId: string, id: string, dto: RejectDTO) {
    const jobApplicantion = await this.jobApplicantRepository.findOne({
      where: {
        id,
        job: {
          company: { id: companyId },
        },
      },
    });
    if (!jobApplicantion) throw new BadRequestException("please try again");

    if (jobApplicantion.status === CandidateStatus.REJECTED) {
      throw new BadRequestException("status of candidate is already rejected");
    }
    jobApplicantion.status = CandidateStatus.REJECTED;
    jobApplicantion.rejectAt = new Date();
    const jobApp = await this.jobApplicantRepository.save(jobApplicantion);

    const reject = this.rejectRepository.create({
      reason: dto.reason,
      application: jobApp,
    });

    await this.rejectRepository.save(reject);

    return {
      message: "convert cadidate status to rejected successful",
      jobApp: {
        id: jobApp.id,
        status: jobApp.status,
        reason: reject.reason,
        rejectAt: jobApp.rejectAt,
      },
    };
  }

  public async hiredCV(companyId: string, id: string, dto: HiredDTO) {
    const jobApplicantion = await this.jobApplicantRepository.findOne({
      where: {
        id,
        job: {
          company: { id: companyId },
        },
      },
    });
    if (!jobApplicantion) throw new BadRequestException("please try again");

    if (jobApplicantion.status === CandidateStatus.HIRED) {
      throw new BadRequestException("status of candidate is already hired");
    }
    const { startDate } = dto;

    jobApplicantion.status = CandidateStatus.HIRED;
    jobApplicantion.hiredAt = new Date();
    await this.jobApplicantRepository.save(jobApplicantion);

    const nHired = this.hiredRepository.create({
      startDate,
      application: jobApplicantion,
    });

    await this.hiredRepository.save(nHired);
    return {
      message: "convert cadidate status to hired successful",
      date: {
        id: jobApplicantion.id,
        status: jobApplicantion.status,
        hiredAt: jobApplicantion.hiredAt,
        startDate: nHired.startDate,
      },
    };
  }

  public async interviewCV(companyId: string, id: string, dto: InterviewDTO) {
    const jobApplicantion = await this.jobApplicantRepository.findOne({
      where: {
        id,
        job: {
          company: { id: companyId },
        },
      },
    });
    if (!jobApplicantion) throw new BadRequestException("please try again");

    const { type, scheduledAt, meetingLink } = dto;

    jobApplicantion.status = CandidateStatus.INTERVIEW;
    jobApplicantion.hiredAt = new Date();
    const jobApp = await this.jobApplicantRepository.save(jobApplicantion);

    const interview = this.interviewRepository.create({
      type,
      scheduledAt,
      meetingLink,
      application: jobApp,
    });

    await this.interviewRepository.save(interview);

    return {
      message: "convert cadidate status to interview successful",
      data: {
        id: jobApp.id,
        status: jobApp.status,
        interviewtype: interview.type,
        meetingLink,
        interviewAt: jobApp.hiredAt,
      },
    };
  }

  public async jobOffer(companyId: string, id: string, dto: JobOfferDTO) {
    const jobApplicantion = await this.jobApplicantRepository.findOne({
      where: {
        id,
        job: {
          company: { id: companyId },
        },
      },
    });
    if (!jobApplicantion) throw new BadRequestException("please try again");

    if (jobApplicantion.status === CandidateStatus.OFFERED) {
      throw new BadRequestException("status of candidate is already offered");
    }

    jobApplicantion.status = CandidateStatus.OFFERED;
    jobApplicantion.sendOfferAt = new Date();

    const jobApp = await this.jobApplicantRepository.save(jobApplicantion);

    const {startDate,offeredSalary,notes}=dto
    const offer = this.jobOfferRepository.create({
      startDate,
      offeredSalary,
      notes,
      application:jobApp
    })

    await this.jobOfferRepository.save(offer)

    return{
      message: "convert cadidate status to interview successful",
      data:{
        id:jobApp.id,
        status:jobApp.status,
        offeredSalary,
        startDate,
        notes,
        offerAt:jobApp.sendOfferAt
      }
    }
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

  public async jobApplicantionByUserByID(userId: string, jobApplyId: string) {
    const jobApplyById = await this.jobApplicantRepository
      .createQueryBuilder("jobApply")
      .leftJoinAndSelect("jobApply.job", "job")
      .leftJoinAndSelect("job.company", "company")
      .where("jobApply.id = :jobApplyId AND jobApply.applicant = :userId", {
        jobApplyId,
        userId,
      })
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
