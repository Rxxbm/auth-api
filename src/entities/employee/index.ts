import { Department, JobTitle } from "../../common/enums";

export type Employee = {
  id: string;
  name: string;
  jobTitle: JobTitle;
  departament: Department;
  auth_id: string;
  created_at: Date;
  updated_at: Date;
};
