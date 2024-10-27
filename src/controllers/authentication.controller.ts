import { Controller } from "../decorators/http/controller";
import { Get } from "../decorators/http/methods";
import { Middleware } from "../decorators/http/middleware";
import { Request, Response, NextFunction } from "express";

@Controller("/auth")
export class AuthController {
  /**
   * @swagger
   * /:
   *   get:
   *     summary: Retorna uma mensagem de boas-vindas
   *     responses:
   *       200:
   *         description: Mensagem de boas-vindas
   *
   *
   */
  @Get("/")
  @Middleware((req: Request, res: Response, next: NextFunction) => {
    console.log("Middleware executed!");
    next();
  })
  public welcome(request: Request, response: Response, next: NextFunction) {
    return response.status(200).json({
      message: "Hello from the index controller!",
      status: 200,
    });
  }
}
