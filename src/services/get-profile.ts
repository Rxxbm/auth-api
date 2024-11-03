import { NotFoundError } from "../errors/not-found-error";
import { EmployeeRepository } from "../repositories/employee-in-memory.repository";

export class GetProfile {
  constructor(private readonly employeeRepository: EmployeeRepository) {}

  public async execute(id: string) {
    const employee = await this.employeeRepository.findByAuthId(id);
    if (!employee) {
      throw new NotFoundError("Funcionário não encontrado");
    }

    return {
      id: employee.id,
      name: employee.name,
      departament: employee.departament,
      jobTitle: employee.jobTitle,
    };
  }
}
