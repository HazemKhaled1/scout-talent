import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { JobApplicant } from "./job_applicant.entity";
import { FindOptionsWhere, Repository } from "typeorm";
import { Interview } from "./interviews.entity";
import { InterviewStatus } from "src/Shared/Enums/Interview.enum";
import { completeInterviewDTO } from "./dto/completeInterview.dto";
import { FeedBack } from "./feedback.entity";
import { rescheduleDTO } from "./dto/reschedule.dto";
import { cancelInterviewDTO } from "./dto/cancelInterview.dto";
import { CancelInterview } from "./cancelInterview.entity";
import { CancelBy } from "src/Shared/Enums/interviewCancel.enum";
import { CandidateStatus } from "src/Shared/Enums/candidateStatus.enum";
import { Reject } from "./reject.entity";

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(JobApplicant)
    private jobApplicantRepository: Repository<JobApplicant>,
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    @InjectRepository(FeedBack)
    private feedbackRepository: Repository<FeedBack>,
    @InjectRepository(CancelInterview)
    private cancelInterviewRepository: Repository<CancelInterview>,
    @InjectRepository(Reject) private rejectRepository: Repository<Reject>,
  ) {}

  public async getAllInterviewWithCompany(companyId: string) {
    const interviews = await this.interviewRepository.find({
      where: {
        application: {
          job: {
            company: {
              id: companyId,
            },
          },
        },
      },
      relations: ["feedback", "CancelInterview"],
    });

    if (!interviews) throw new BadRequestException("there is no job interview");
    return { data: interviews };
  }

  public async completeInterview(
    interviewId: string,
    companyId: string,
    dto: completeInterviewDTO,
  ) {
    const interview = await this.interviewRepository.findOne({
      where: {
        id: interviewId,
        application: { job: { company: { id: companyId } } },
      },
    });
    if (!interview) throw new BadRequestException("there is no interview");

    if (interview.status === InterviewStatus.COMPLETED)
      throw new BadRequestException("this interview is already complete");

    if (interview.status === InterviewStatus.CANCELLED) {
      throw new BadRequestException("this interview is cancel");
    }

    const now = new Date();

    if (interview.scheduledAt > now) {
      throw new BadRequestException("Interview is not finished yet");
    }

    const { publicFeedback, rating, nextStep } = dto;

    interview.status = InterviewStatus.COMPLETED;
    await this.interviewRepository.save(interview);

    const feedback = this.feedbackRepository.create({
      publicFeedback,
      rating,
      nextStep,
      interview,
    });

    await this.feedbackRepository.save(feedback);

    return {
      data: {
        feedback,
      },
    };
  }

  public async rescheduleInterview(
    interviewId: string,
    dto: rescheduleDTO,
    companyId: string,
  ) {
    const interview = await this.interviewRepository.findOne({
      where: {
        id: interviewId,
        application: { job: { company: { id: companyId } } },
      },
    });
    if (!interview) throw new BadRequestException("there is no interview");

    if (
      !(
        interview.status === InterviewStatus.SCHEDULED ||
        interview.status === InterviewStatus.RESCHEDULED
      )
    ) {
      throw new BadRequestException(
        `can't rescheduled, the interview status is ${interview.status}`,
      );
    }
    const now = new Date();

    if (interview.scheduledAt <= now) {
      throw new BadRequestException(
        "can't reschedule, interview already finished",
      );
    }

    if (dto.scheduledAt <= now) {
      throw new BadRequestException("the scheduled date must be in the future");
    }

    interview.scheduledAt = dto.scheduledAt;
    interview.meetingLink = dto.meetingLink;
    interview.status = InterviewStatus.RESCHEDULED;

    const Ninter = await this.interviewRepository.save(interview);

    return {
      data: {
        id: Ninter.id,
        status: Ninter.status,
        scheduledAt: Ninter.scheduledAt,
        meetingLink: Ninter.meetingLink,
      },
    };
  }

  public async cancelInterview(
    interviewId: string,
    dto: cancelInterviewDTO,
    cancelBy: CancelBy,
    companyId?: string,
    applicantId?: string,
  ) {
    if (cancelBy === CancelBy.COMPANY && !companyId) {
      throw new BadRequestException("companyId is required");
    }

    if (cancelBy === CancelBy.APPLICANT && !applicantId) {
      throw new BadRequestException("applicantId is required");
    }

    let where: FindOptionsWhere<Interview>;

    if (cancelBy === CancelBy.COMPANY) {
      where = {
        id: interviewId,
        application: {
          job: { company: { id: companyId } },
        },
      };
    } else {
      where = {
        id: interviewId,
        application: {
          applicant: { id: applicantId },
        },
      };
    }

    const interview = await this.interviewRepository.findOne({
      where,
      relations: ["application"],
    });
    if (!interview) throw new BadRequestException("there is no interview");

    if (!(interview.status === InterviewStatus.CANCELLED)) {
      throw new BadRequestException(`this interview already cancel`);
    }
    interview.status = InterviewStatus.CANCELLED;
    interview.application.status = CandidateStatus.REJECTED;
    interview.application.rejectAt = new Date();
    await this.interviewRepository.save(interview);
    await this.jobApplicantRepository.save(interview.application);

    const cancel = this.cancelInterviewRepository.create({
      reason: dto.reason,
      cancelBy,
      interview,
    });
    const Ncancel = await this.cancelInterviewRepository.save(cancel);

    const reject = this.rejectRepository.create({
      reason: dto.reason,
      application: interview.application,
    });

    await this.rejectRepository.save(reject);

    return {
      data: {
        id: Ncancel.id,
        reason: Ncancel.reason,
        cancelBy: Ncancel.cancelBy,
        createdAt: Ncancel.createdAt,
      },
    };
  }

  public async getApplicantInterviews(applicantId: string) {
    const interviews = await this.interviewRepository.find({
      where: { application: { applicant: { id: applicantId } } },
      relations: ["feedback", "CancelInterview"],
    });

    if (!interviews)
      throw new BadRequestException("there is no interview for this applicant");

    return { data: { interviews } };
  }

  public async getInterviewStatsWithCompany(companyId: string) {
    const total = await this.jobApplicantRepository
      .createQueryBuilder("jobApply")
      .leftJoin("jobApply.job", "job")
      .leftJoin("job.company", "company")
      .leftJoin("jobApply.interviews", "interview")
      .where("company.id = :companyId", { companyId })
      .andWhere("interview.id IS NOT NULL")
      .getCount();

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const todayInterview = await this.interviewRepository
      .createQueryBuilder("interview")
      .leftJoin("interview.application", "application")
      .leftJoin("application.job", "job")
      .leftJoin("job.company", "company")
      .where("company.id = :companyId", { companyId })
      .andWhere("interview.scheduledAt BETWEEN :start AND :end", {
        start: startOfDay,
        end: endOfDay,
      })
      .getCount();

    const upcoming = await this.interviewRepository
      .createQueryBuilder("interview")
      .leftJoin("interview.application", "application")
      .leftJoin("application.job", "job")
      .leftJoin("job.company", "company")
      .where("company.id = :companyId", { companyId })
      .andWhere("interview.status IN (:...statuses)", {
        statuses: [InterviewStatus.SCHEDULED, InterviewStatus.RESCHEDULED],
      })
      .getCount();

    const completed = await this.interviewRepository
      .createQueryBuilder("interview")
      .leftJoin("interview.application", "application")
      .leftJoin("application.job", "job")
      .leftJoin("job.company", "company")
      .where("company.id = :companyId", { companyId })
      .andWhere("interview.status = :status", {
        status: InterviewStatus.COMPLETED,
      })
      .getCount();

    return {
      data: {
        total,
        todayInterview,
        upcoming,
        completed,
      },
    };
  }

  public async getInterviewStatsWithApplicant(applicantId: string) {
    const total = await this.jobApplicantRepository
      .createQueryBuilder("jobApply")
      .leftJoin("jobApply.applicant", "applicant")
      .leftJoin("jobApply.interviews", "interview")
      .where("applicant.id = :applicantId", { applicantId })
      .andWhere("interview.id IS NOT NULL")
      .getCount();

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const todayInterview = await this.interviewRepository
      .createQueryBuilder("interview")
      .leftJoin("interview.application", "application")
      .leftJoin("application.applicant", "applicant")
      .where("applicant.id = :applicantId", { applicantId })
      .andWhere("interview.scheduledAt BETWEEN :start AND :end", {
        start: startOfDay,
        end: endOfDay,
      })
      .getCount();

    const upcoming = await this.interviewRepository
      .createQueryBuilder("interview")
      .leftJoin("interview.application", "application")
      .leftJoin("application.applicant", "applicant")
      .where("applicant.id = :applicantId", { applicantId })
      .andWhere("interview.status IN (:...statuses)", {
        statuses: [InterviewStatus.SCHEDULED, InterviewStatus.RESCHEDULED],
      })
      .getCount();

    const completed = await this.interviewRepository
      .createQueryBuilder("interview")
      .leftJoin("interview.application", "application")
      .leftJoin("application.applicant", "applicant")
      .where("applicant.id = :applicantId", { applicantId })
      .andWhere("interview.status = :status", {
        status: InterviewStatus.COMPLETED,
      })
      .getCount();

    return {
      data: {
        total,
        todayInterview,
        upcoming,
        completed,
      },
    };
  }
}
