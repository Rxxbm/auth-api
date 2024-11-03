import { Repository } from "../common/protocols/repository";
import { Employee } from "../entities/employee";

export type Input = {
  name: string;
  jobTitle: string;
  role: string;
};

export class EmployeeInMemoryRepository implements Repository<Employee> {
  private users: Employee[] = [];

  public async create(account: any) {
    account.id = crypto.randomUUID();
    account.created_at = new Date();
    account.updated_at = new Date();
    this.users.push(account);
    return account;
  }
  public async list(): Promise<Employee[]> {
    return this.users;
  }

  async delete(id: string): Promise<void> {
    this.users = this.users.filter((user) => user.id !== id);
  }

  async findById(id: string): Promise<Employee | null> {
    const user = this.users.find((user) => user.id === id);
    return user ? user : null;
  }

  async update(id: string, data: Partial<Employee>): Promise<Employee | null> {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) return null;
    this.users[index] = { ...this.users[index], ...data };
    return this.users[index];
  }
}
