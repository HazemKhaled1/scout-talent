import { PartialType } from "@nestjs/swagger"
import { addExperienceDTO } from "./addExperience.dto"


export class updateExperienceDTO extends PartialType(addExperienceDTO) {}