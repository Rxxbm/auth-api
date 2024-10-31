import { validate } from "class-validator";
import { Controller } from "../decorators/http/controller";
import { Get, Post } from "../decorators/http/methods";
import { Middleware } from "../decorators/http/middleware";
import { Request, Response, NextFunction } from "express";
import { plainToInstance } from "class-transformer";
import { CreateAccountDto } from "../dtos/authentication.dto";

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
  @Middleware((req: Request, res: Response, next: NextFunction) => {
    console.log("Middleware for create-account executed!");
    next();
  })
  public async createAccount(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    const accountDto = plainToInstance(CreateAccountDto, request.body);

    const errors = await validate(accountDto);
    if (errors.length > 0) {
      return response.status(400).json({
        message: "Dados inválidos",
        errors: errors
          .map((error) => Object.values(error.constraints as unknown as any))
          .flat(),
      });
    }
    // Simulação de criação de conta
    const newUser = {
      id: Date.now(),
      username: accountDto.name,
    };

    return response.status(201).json({
      message: "Conta criada com sucesso",
      user: newUser,
    });
  }
}
