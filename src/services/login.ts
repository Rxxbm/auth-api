import { LoginDto } from "../dtos/login.dto";
import { NotFoundError } from "../errors/not-found-error";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { AuthRepository } from "../repositories/auth/auth-in-memory.repository";
import { comparePasswords } from "../thirdparty/bcrypt";

export class Login {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(account: LoginDto) {
    const user = await this.authRepository.findByEmail(account.email);
    if (!user) throw new NotFoundError("Usuário não encontrado!");

    const isValid = await comparePasswords(account.password, user.password);
    if (!isValid) throw new UnauthorizedError("Senha ou email incorreto!");
    return user;
  }
}
