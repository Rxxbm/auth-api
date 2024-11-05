import { Controller } from "../decorators/http/controller";
import { Get, Post } from "../decorators/http/methods";
import { Middleware } from "../decorators/http/middleware";
import { Request, Response } from "express";
import { CreateAccountDto } from "../dtos/create-account.dto";
import { CreateAccount } from "../services/create-account.service";
import { authRepository } from "../repositories/auth-in-memory.repository";
import { ValidateDto } from "../config/dto";
import { hashPassword } from "../thirdparty/bcrypt";
import { RouteResponse } from "../common/http-responses";
import { ConflictError } from "../errors/conflict-error";
import { employeeRepository } from "../repositories/employee-in-memory.repository";
import { LoginDto } from "../dtos/login.dto";
import { Login } from "../services/login";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { JwtToken, makeJwtToken } from "../thirdparty/jwt";
import { NotFoundError } from "../errors/not-found-error";
import { GetProfile } from "../services/get-profile";

const authInMemoryRepository = authRepository; // Instância do repositório de autenticação em memória
const employeeInMemoryRepository = employeeRepository; // Instância do repositório de funcionários em memória

const createAccountUseCase = new CreateAccount( // Instância do caso de uso de criação de conta
  employeeInMemoryRepository,
  authInMemoryRepository
);
const loginUsecase = new Login(authInMemoryRepository); // Instância do caso de uso de login
const getProfileUsecase = new GetProfile(employeeInMemoryRepository); // Instância do caso de uso de busca de perfil

@Controller("/auth")
export class AuthController {
  /**
   * @swagger
   * /auth/:
   *   post:
   *     summary: Cria uma nova conta
   *     description: Cria uma nova conta de usuário com os dados fornecidos.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: O nome de usuário.
   *                 example: "João Silva"
   *               password:
   *                 type: string
   *                 description: A senha do usuário (mínimo 6 caracteres).
   *                 example: "senha123"
   *               email:
   *                 type: string
   *                 format: email
   *                 description: O e-mail do usuário.
   *                 example: "joao.silva@email.com"
   *               role:
   *                 type: string
   *                 description: O cargo de permissão do usuário.
   *                 enum: [Admin, User]
   *                 example: "User"
   *               department:
   *               - in: query
   *                 description: A célula do usuário.
   *                 schema:
   *                    type: string
   *                    enum: [
   *                      MarketingComunicação,
   *                      MarketingPassiva,
   *                      GestãoAdministrativaDePessoas,
   *                      ProjetosQualidade,
   *                      ProjetosComputação,
   *                      PRESIDENCIA,
   *                      AdministrativaFinanceiro,
   *                      Comercial
   *                    ]
   *                 example: "GestãoAdministrativaDePessoas"
   *               jobTitle:
   *                 type: string
   *                 description: O cargo do usuário.
   *                 enum: [
   *                   Assessor,
   *                   Diretor,
   *                   Coordenador,
   *                   ProductOwner,
   *                   Presidente
   *                 ]
   *                 example: "Coordenador"
   *     responses:
   *       201:
   *         description: Conta criada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: boolean
   *                   example: true
   *                 date:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-11-03T23:59:58.192Z"
   *                 data:
   *                   type: object
   *                   properties:
   *                     auth_id:
   *                       type: string
   *                       description: ID de autenticação gerado para a conta.
   *                       example: "9c0b10d1-5d3a-4c1f-a3a2-0e3e5b682d36"
   *                     departament:
   *                       type: string
   *                       description: A célula do usuário.
   *                       example: "MarketingComunicação"
   *                     role:
   *                       type: string
   *                       description: O cargo de permissão do usuário.
   *                       example: "User"
   *                     email:
   *                       type: string
   *                       format: email
   *                       description: O e-mail do usuário.
   *                       example: "user@example.com"
   *                     jobTitle:
   *                       type: string
   *                       description: O cargo do usuário.
   *                       example: "Coordenador"
   *                     name:
   *                       type: string
   *                       description: O nome de usuário.
   *                       example: "Maria Oliveira"
   *                     password:
   *                       type: string
   *                       description: A senha do usuário (armazenada de forma criptografada).
   *                       example: "$2b$10$6uCVGIKI1L4yCdFwABXojudJwcjHUeVEUXoAjO3.rR7e0zgN.uWv6"
   *                     id:
   *                       type: string
   *                       description: ID da conta criada.
   *                       example: "f9c14c29-2b9e-41de-b3d7-d7be43e01768"
   *                     created_at:
   *                       type: string
   *                       format: date-time
   *                       description: Data e hora em que a conta foi criada.
   *                       example: "2024-11-03T23:59:58.192Z"
   *                     updated_at:
   *                       type: string
   *                       format: date-time
   *                       description: Data e hora da última atualização da conta.
   *                       example: "2024-11-03T23:59:58.192Z"
   *       400:
   *         description: Dados inválidos
   *       409:
   *         description: Conflito, conta já existe
   */
  @Post("/")
  @Middleware(ValidateDto(CreateAccountDto)) // Validação dos dados de entrada
  public async createAccount(request: Request, response: Response) {
    try {
      const hashedPassword = await hashPassword(request.body.password); // Criptografa a senha do usuário
      const account = await createAccountUseCase.execute({
        // Cria conta de usuário com base nos dados fornecidos
        ...request.body,
        password: hashedPassword,
      });

      return RouteResponse.successCreated(response, account);
    } catch (error) {
      if (error instanceof ConflictError) {
        return RouteResponse.conflictError(error.message, response);
      } else {
        return RouteResponse.serverError(error, response);
      }
    }
  }

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Autentica um usuário
   *     description: Faz o login do usuário com o e-mail e a senha fornecidos.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Login bem-sucedido
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: boolean
   *                   example: true
   *                 date:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-11-04T00:02:29.032Z"
   *                 data:
   *                   type: object
   *                   properties:
   *                     token:
   *                       type: string
   *                       description: Token de autenticação JWT gerado para o usuário.
   *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoX2lkIjoiN2ExZWQ0NTQtNTA2NC00ZTExLTkxMzEtZTQyZDRhMDU2YzU3IiwiZW1haWwiOiJhQG1haWwuY29tIiwicm9sZSI6IkFkbWluIiwiaWF0IjoxNzMwNjc4NTQ5LCJleHAiOjE3MzA2ODIxNDl9.N0jk6TkPZtw_8X0itZzFcQiCr_oZ0dR1ue4IzG06L-g"
   *       401:
   *         description: Não autorizado, credenciais inválidas
   *       404:
   *         description: Usuário não encontrado
   */
  @Post("/login")
  @Middleware(ValidateDto(LoginDto)) // Validação dos dados de entrada
  public async login(request: Request, response: Response) {
    try {
      const auth = await loginUsecase.execute(request.body); // Realiza login do usuário com base no e-mail e senha fornecidos

      const payload = {
        auth_id: auth.id,
        email: auth.email,
        role: auth.role,
      };

      const token = makeJwtToken(payload); // Cria token JWT com base nas informações do usuário

      return RouteResponse.success(response, { token }); // Retorna token JWT gerado
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return RouteResponse.unauthorized(response, error.message);
      } else if (error instanceof NotFoundError) {
        return RouteResponse.notFound(response, error.message);
      } else {
        return RouteResponse.serverError(error, response);
      }
    }
  }

  /**
   * @swagger
   * /auth/me:
   *   get:
   *     summary: Obtém informações do perfil do usuário autenticado
   *     description: Retorna os dados do perfil do usuário logado com base no token JWT.
   *     responses:
   *       200:
   *         description: Dados do perfil retornados com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: boolean
   *                   example: true
   *                 date:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-11-04T00:06:20.602Z"
   *                 data:
   *                   type: object
   *                   properties:
   *                     auth_id:
   *                       type: string
   *                       description: ID de autenticação gerado para o usuário.
   *                       example: "d8b36549-28ee-4ec4-9732-9e9f782fb1b8"
   *                     email:
   *                       type: string
   *                       description: E-mail do usuário.
   *                       example: "b@mail.com"
   *                     role:
   *                       type: string
   *                       description: Cargo de permissão do usuário.
   *                       enum:
   *                         - Admin
   *                         - User
   *                       example: "User"
   *                     iat:
   *                       type: integer
   *                       description: Timestamp indicando quando o token foi emitido.
   *                       example: 1730678771
   *                     exp:
   *                       type: integer
   *                       description: Timestamp indicando quando o token expira.
   *                       example: 1730682371
   *                     id:
   *                       type: string
   *                       description: ID único do usuário.
   *                       example: "b0dabea2-2f00-464f-b56e-42f11261cc3e"
   *                     name:
   *                       type: string
   *                       description: Nome do usuário.
   *                       example: "Another Name"
   *                     departament:
   *                       type: string
   *                       description: Célula a que o usuário pertence.
   *                       enum:
   *                         - MarketingComunicação
   *                         - MarketingPassiva
   *                         - GestãoAdministrativaDePessoas
   *                         - ProjetosQualidade
   *                         - ProjetosComputação
   *                         - PRESIDENCIA
   *                         - AdministrativaFinanceiro
   *                         - Comercial
   *                       example: "MarketingPassiva"
   *                     jobTitle:
   *                       type: string
   *                       description: Cargo do usuário.
   *                       enum:
   *                         - Assessor
   *                         - Diretor
   *                         - Coordenador
   *                         - ProductOwner
   *                         - Presidente
   *                       example: "Diretor"
   *       401:
   *         description: Não autorizado, token inválido ou expirado
   *       404:
   *         description: Perfil do usuário não encontrado
   */
  @Get("/me")
  @JwtToken()
  public async me(request: Request, response: Response) {
    try {
      const profile = await getProfileUsecase.execute(request.user.auth_id); // Reaçiza busca do perfil do usuário pelo ID de autenticação
      return RouteResponse.success(response, { ...request.user, ...profile });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return RouteResponse.notFound(response, error.message);
      } else {
        return RouteResponse.serverError(error, response);
      }
    }
  }
}
