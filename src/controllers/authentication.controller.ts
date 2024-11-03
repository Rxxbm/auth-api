import { Controller } from "../decorators/http/controller";
import { Get, Post } from "../decorators/http/methods";
import { Middleware } from "../decorators/http/middleware";
import { Request, Response } from "express";
import { CreateAccountDto } from "../dtos/create-account.dto";
import { CreateAccount } from "../services/create-account.service";
import { AuthInMemoryRepository } from "../repositories/auth-in-memory.repository";
import { ValidateDto } from "../config/dto";
import { hashPassword } from "../thirdparty/bcrypt";
import { RouteResponse } from "../common/http-responses";
import { ConflictError } from "../errors/conflict-error";
import { EmployeeInMemoryRepository } from "../repositories/employee-in-memory.repository";
import { LoginDto } from "../dtos/login.dto";
import { Login } from "../services/login";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { JwtToken, makeJwtToken } from "../thirdparty/jwt";
import { NotFoundError } from "../errors/not-found-error";
import { GetProfile } from "../services/get-profile";

const authInMemoryRepository = new AuthInMemoryRepository();
const employeeInMemoryRepository = new EmployeeInMemoryRepository();

const createAccountUseCase = new CreateAccount(
  employeeInMemoryRepository,
  authInMemoryRepository
);
const loginUsecase = new Login(authInMemoryRepository);
const getProfileUsecase = new GetProfile(employeeInMemoryRepository);

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

  @Post("/login")
  @Middleware(ValidateDto(LoginDto))
  public async login(request: Request, response: Response) {
    try {
      const auth = await loginUsecase.execute(request.body);

      // Crie o payload com os dados do usuário
      const payload = {
        auth_id: auth.id,
        email: auth.email,
        role: auth.role, // ou outras propriedades relevantes do usuário
      };

      // Gere o token JWT
      const token = makeJwtToken(payload);

      // Responda com o token
      return RouteResponse.success(response, { token });
    } catch (error) {
      if (error instanceof Error) {
        if (error instanceof UnauthorizedError) {
          return RouteResponse.unauthorized(response, error.message);
        } else if (error instanceof NotFoundError) {
          return RouteResponse.notFound(response, error.message);
        }
      } else {
        return RouteResponse.serverError(error, response);
      }
    }
  }

  @Get("/me")
  @JwtToken()
  public async me(request: Request, response: Response) {
    try {
      const profile = await getProfileUsecase.execute(request.user.auth_id);
      return RouteResponse.success(response, { ...request.user, ...profile });
    } catch (error) {
      if (error instanceof Error) {
        if (error instanceof NotFoundError) {
          return RouteResponse.notFound(response, error.message);
        }
      } else {
        return RouteResponse.serverError(error, response);
      }
    }
  }
}
