import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
  @IsNotEmpty({ message: "A senha é obrigatória." })
  @IsString({ message: "A senha deve ser uma string." })
  password: string;

  @IsNotEmpty({ message: "O e-mail é obrigatório." })
  @IsEmail({}, { message: "O e-mail é inválido." })
  email: string;
}
