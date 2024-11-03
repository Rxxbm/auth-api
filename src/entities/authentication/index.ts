import { EmployeeRole } from "../../common/enums";

export type Auth = {
  id: string;
  email: string;
  password: string;
  role: EmployeeRole;
  created_at: Date;
  updated_at: Date;
};
