import { Repository } from "../common/protocols/repository";
import { Auth } from "../entities/authentication";

export class AuthInMemoryRepository implements Repository<Auth> {
  private users: Auth[] = [];

  public async create(account: any) {
    account.id = crypto.randomUUID();
    account.created_at = new Date();
    account.updated_at = new Date();
    this.users.push(account);
    return account;
  }

  public async findByEmail(email: string) {
    return this.users?.find((user) => user.email === email);
  }

  public async list(): Promise<Auth[]> {
    return this.users;
  }

  async delete(id: string): Promise<void> {
    this.users = this.users.filter((user) => user.id !== id);
  }

  async findById(id: string): Promise<Auth | null> {
    const user = this.users.find((user) => user.id === id);
    return user ? user : null;
  }

  async update(id: string, data: Partial<Auth>): Promise<Auth | null> {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) return null;
    this.users[index] = { ...this.users[index], ...data };
    return this.users[index];
  }
}

export interface AuthRepository extends Repository<Auth> {
  findByEmail(email: string): Promise<Auth | undefined>;
}

export const authRepository = new AuthInMemoryRepository();
