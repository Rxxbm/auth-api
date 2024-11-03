import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { RouteResponse } from "../common/http-responses";

export function ValidateDto(dtoClass: any): RequestHandler {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const dtoInstance = plainToInstance(dtoClass, req.body);
    const errors = await validate(dtoInstance);

    if (errors.length > 0) {
      const errorMessages = errors
        .map((error) => Object.values(error.constraints || {}))
        .flat();

      return RouteResponse.badRequest(res, {
        message: "Dados inválidos",
        errors: errorMessages,
      });
    }

    req.body = dtoInstance;
    next();
  };
}
