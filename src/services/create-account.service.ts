import { Repository } from "../common/protocols/repository";
import { CreateAccountDto } from "../dtos/create-account.dto";
import { Employee } from "../entities/employee";
import { ConflictError } from "../errors/conflict-error";
import { AuthRepository } from "../repositories/auth/auth-in-memory.repository";

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

    const newAuth = {
      email: account.email,
      password: account.password,
      role: account.role,
    };

    const auth = await this.authRepository.create(newAuth);

    const newEmployee = {
      auth_id: auth.id,
      departament: account.departament,
      jobTitle: account.jobTitle,
      name: account.name,
    };

    const employee = await this.employeeRepository.create(newEmployee);

    return employee;
  }
}
