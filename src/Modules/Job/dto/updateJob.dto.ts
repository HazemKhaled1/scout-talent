import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { JobStatus ,JobType,WorkMode} from "src/utils/Enums/job.enum"


export class updateJobDTO{

    @IsOptional()
    @ApiPropertyOptional()
    title: string;

    @IsOptional()
    @ApiPropertyOptional()
    location: string;

    @IsOptional()
    @ApiPropertyOptional()
    minSalary: number;

    @IsOptional()
    @ApiPropertyOptional()
    maxSalary: number;

    @IsOptional()
    @ApiPropertyOptional()
    currency: string;

    @IsOptional()
    @ApiPropertyOptional()
    type: JobType;

    @IsOptional()
    @ApiPropertyOptional()
    status: JobStatus;

    @IsOptional()
    @ApiPropertyOptional()
    workMode: WorkMode;

    @IsOptional()
    @ApiPropertyOptional()
    description: string;

    @IsOptional()
    @ApiPropertyOptional()
    skills: string[];

    @IsOptional()
    @ApiPropertyOptional()
    responsibilities: string[];

    @IsOptional()
    @ApiPropertyOptional()
    requirements: string;
}