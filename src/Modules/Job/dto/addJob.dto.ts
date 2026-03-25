import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString } from "class-validator";
import { JobStatus, JobType, WorkMode } from "src/Shared/Enums/job.enum";

export class addJobDTO {
  @IsString()
  @ApiProperty()
  title: string;

  @IsString()
  @ApiProperty()
  location: string;

  @IsNumber()
  @ApiProperty()
  minSalary: number;

  @IsNumber()
  @ApiProperty()
  maxSalary: number;

  @IsString()
  @ApiProperty()
  type: JobType;

  @IsString()
  @ApiProperty()
  status: JobStatus;

  @IsString()
  @ApiProperty()
  workMode: WorkMode;

  @IsString()
  @ApiProperty()
  description: string;

  @IsArray()
  @ApiProperty()
  skills: string[];

  @IsArray()
  @ApiProperty()
  responsibilities: string[];

  @IsString()
  @ApiProperty()
  requirements: string;

  @IsNumber()
  @ApiProperty()
  positions: number;

  @IsNumber()
  @ApiProperty({ required: false })
  maxApplications: number;
}
