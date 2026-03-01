import { ApiProperty } from "@nestjs/swagger";
import { JobStatus } from "src/utils/Enums/job.enum";

export class jobStatusDTO {
    @ApiProperty()
    status:JobStatus
}