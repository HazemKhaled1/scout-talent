import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsString, MinDate } from "class-validator";

export class rescheduleDTO {
  @Type(() => Date)
  @IsDate()
  @MinDate(new Date(), { message: 'the scheduled date must be in the future' })
  @ApiProperty()
  scheduledAt: Date;

  @IsString()
  @ApiProperty()
  meetingLink: string;
}
