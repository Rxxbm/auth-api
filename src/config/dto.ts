import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction, RequestHandler } from "express";

export function ValidateDto(dtoClass: any): RequestHandler {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const dtoInstance = plainToInstance(dtoClass, req.body);
    const errors = await validate(dtoInstance);

    if (errors.length > 0) {
      res.status(400).json({
        message: "Dados inválidos",
        errors: errors
          .map((error) => Object.values(error.constraints || {}))
          .flat(),
      });
      return;
    }

    req.body = dtoInstance;
    next();
  };
}
