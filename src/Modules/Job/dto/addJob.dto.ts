import { ApiProperty } from "@nestjs/swagger";
import { JobStatus ,JobType,WorkMode} from "src/utils/Enums/job.enum"


export class addJobDTO{

    @ApiProperty()
    title: string;

    @ApiProperty()
    location: string;

    @ApiProperty()
    minSalary: number;

    @ApiProperty()
    maxSalary: number;

    @ApiProperty()
    type: JobType;

    @ApiProperty()
    status: JobStatus;

    @ApiProperty()
    workMode: WorkMode;

    @ApiProperty()
    description: string;

    @ApiProperty()
    skills: string[];

    @ApiProperty()
    responsibilities: string[];

    @ApiProperty()
    requirements: string;
}