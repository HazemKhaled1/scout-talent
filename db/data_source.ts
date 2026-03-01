
import { DataSource ,DataSourceOptions} from "typeorm"
import {config} from 'dotenv'
import { User } from "src/Modules/Users/user.entity"
import { CV } from "src/Modules/CV/cv.entity"
import { Job } from "src/Modules/Job/job.entity"
import { JobApplicant } from "src/Modules/Job/job_applicant.entity"
import { SkillOrSpecializations } from "src/Modules/Skills/skills.entity"
import { Experience } from "src/Modules/Experience/experience.entity"
config({path:'.env'})

export const dataSourceOptions :DataSourceOptions = {
    type:'postgres',
    url:process.env.DB_URL,
    entities:[ User , CV ,Job ,JobApplicant ,SkillOrSpecializations , Experience],
    migrations:['dist/db/migrations/*.js']
}

const dataSource = new DataSource(dataSourceOptions)
export default dataSource