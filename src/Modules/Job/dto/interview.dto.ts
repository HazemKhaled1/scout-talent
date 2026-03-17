import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { InterviewTypes } from "src/Shared/Enums/InterviewTypes.enum";

export class InterviewDTO {
  @IsString()
  @ApiProperty()
  type: InterviewTypes;

  @IsString()
  @ApiProperty()
  scheduledAt: string;

  @IsString()
  @ApiProperty()
  meetingLink: string;
}
