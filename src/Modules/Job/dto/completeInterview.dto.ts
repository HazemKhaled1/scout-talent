import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, Max, Min } from "class-validator";
import { InterviewNextStep } from "src/Shared/Enums/Interview.enum";

export class completeInterviewDTO {
  @IsString()
  @ApiProperty()
  publicFeedback: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  @ApiProperty()
  rating: number;

  @IsString()
  @ApiProperty()
  nextStep: InterviewNextStep;
}
