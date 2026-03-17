import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class JobOfferDTO {
  @IsString()
  @ApiProperty()
  offeredSalary: string;

  @IsString()
  @ApiProperty()
  startDate: string;

  @IsString()
  @ApiProperty({ required: false })
  notes: string;
}
