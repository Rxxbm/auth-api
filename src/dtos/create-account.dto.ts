import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from "class-validator";
import { Department, EmployeeRole, JobTitle } from "../common/enums";

export class CreateAccountDto {
  @IsNotEmpty({ message: "O nome de usuário é obrigatório." })
  @IsString({ message: "O nome de usuário deve ser uma string." })
  name: string;

  @IsNotEmpty({ message: "A senha é obrigatória." })
  @IsString({ message: "A senha deve ser uma string." })
  @MinLength(6, { message: "A senha deve ter no mínimo 6 caracteres." })
  password: string;

  @IsNotEmpty({ message: "O e-mail é obrigatório." })
  @IsEmail({}, { message: "O e-mail é inválido." })
  email: string;

  @IsNotEmpty({ message: "O cargo de permissão é obrigatório." })
  @IsEnum(EmployeeRole, {
    message: "O cargo de permissão deve ser um dos listados no enum",
  })
  role: EmployeeRole;

  @IsNotEmpty({ message: "A célula é obrigatória." })
  @IsEnum(Department, { message: "A célula deve ser uma das listadas no enum" })
  departament: Department;

  @IsNotEmpty({ message: "O cargo é obrigatório." })
  @IsEnum(JobTitle, { message: "O cargo deve ser um dos listados no enum" })
  jobTitle: JobTitle;
}
