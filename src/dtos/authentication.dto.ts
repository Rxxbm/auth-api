import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

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

  @IsNotEmpty({ message: "O cargo é obrigatório." })
  @IsString({ message: "O cargo deve ser uma string." })
  role: string;
}
