import { Controller } from "../decorators/http/controller";
import { Get, Post } from "../decorators/http/methods";
import { Middleware } from "../decorators/http/middleware";
import { Request, Response } from "express";
import { CreateAccountDto } from "../dtos/authentication.dto";
import { CreateAccount } from "../services/create-account.service";
import { AuthInMemoryRepository } from "../repositories/auth-in-memory.repository";
import { ValidateDto } from "../config/dto";
import { hashPassword } from "../thirdparty/bcrypt";
import { RouteResponse } from "../common/http-responses";
import { ConflictError } from "../errors/conflict-error";
import { EmployeeInMemoryRepository } from "../repositories/employee-in-memory.repository";

const authInMemoryRepository = new AuthInMemoryRepository();
const employeeInMemoryRepository = new EmployeeInMemoryRepository();
const createAccountUseCase = new CreateAccount(
  employeeInMemoryRepository,
  authInMemoryRepository
);

@Controller("/auth")
export class AuthController {
  /**
   * @swagger
   * /auth/:
   *   post:
   *     summary: Cria uma nova conta
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       201:
   *         description: Conta criada com sucesso
   *       400:
   *         description: Dados inválidos
   */
  @Post("/")
  @Middleware(ValidateDto(CreateAccountDto)) // Por meio de um middleware valida se os dados da requisão está correto
  public async createAccount(request: Request, response: Response) {
    try {
      //Realiza o HASH da senha
      const hashedPassword = await hashPassword(request.body.password);
      // Chama o caso de uso para criar a conta
      const account = await createAccountUseCase.execute({
        ...request.body,
        password: hashedPassword,
      });

      return RouteResponse.successCreated(response, account);
    } catch (error) {
      if (error instanceof Error) {
        if (error instanceof ConflictError) {
          return RouteResponse.conflictError(error.message, response);
        }
      } else {
        return RouteResponse.serverError(error, response);
      }
    }
  }
}
