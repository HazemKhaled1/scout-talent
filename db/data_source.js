"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSourceOptions = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
const user_entity_1 = require("../src/Modules/Users/user.entity");
const cv_entity_1 = require("../src/Modules/CV/cv.entity");
const job_entity_1 = require("../src/Modules/Job/job.entity");
const job_applicant_entity_1 = require("../src/Modules/Job/job_applicant.entity");
const skills_entity_1 = require("../src/Modules/Skills/skills.entity");
const experience_entity_1 = require("../src/Modules/Experience/experience.entity");
(0, dotenv_1.config)({ path: '.env' });
exports.dataSourceOptions = {
    type: 'postgres',
    url: process.env.DB_URL,
    entities: [user_entity_1.User, cv_entity_1.CV, job_entity_1.Job, job_applicant_entity_1.JobApplicant, skills_entity_1.SkillOrSpecializations, experience_entity_1.Experience],
    migrations: ['dist/db/migrations/*.js']
};
const dataSource = new typeorm_1.DataSource(exports.dataSourceOptions);
exports.default = dataSource;
//# sourceMappingURL=data_source.js.map