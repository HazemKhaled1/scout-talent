import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { JobStatus } from "src/Shared/Enums/job.enum";

export class jobStatusDTO {

    @IsString()
    @ApiProperty()
    status:JobStatus
}