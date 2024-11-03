import { Repository } from "../common/protocols/repository";
import { CreateAccountDto } from "../dtos/authentication.dto";
import { Employee } from "../entities/employee";
import { ConflictError } from "../errors/conflict-error";
import { AuthRepository } from "../repositories/auth-in-memory.repository";
import { hashPassword } from "../thirdparty/bcrypt";

export class CreateAccount {
  constructor(
    private readonly employeeRepository: Repository<Employee>,
    private readonly authRepository: AuthRepository
  ) {}

  public async execute(account: CreateAccountDto) {
    const user = await this.authRepository.findByEmail(account.email);
    if (user) {
      throw new ConflictError("Usuário já cadastrado");
    }

    const hashedPassword = await hashPassword(account.password);

    const auth = await this.authRepository.create({
      ...account,
      password: hashedPassword,
    });

    const newEmployee = {
      authId: auth.id,
      departament: account.departament,
      role: auth.role,
      email: auth.email,
      jobTitle: account.jobTitle,
      name: account.name,
      password: auth.password,
    };

    const employee = await this.employeeRepository.create(newEmployee);

    return employee;
  }
}
