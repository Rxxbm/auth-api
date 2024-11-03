import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { RouteResponse } from "../common/http-responses";

// Extensão da interface Request para incluir a propriedade 'user'
declare module "express-serve-static-core" {
  interface Request {
    user?: any;
  }
}

export function JwtToken() {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return RouteResponse.unauthorized(
          res,
          "Acesso negado, token não fornecido"
        );
      }

      try {
        const secretKey = process.env.JWT_SECRET || "default";
        req.user = jwt.verify(token, secretKey); // Adiciona o payload decodificado ao req
        return originalMethod.apply(this, [req, res, next]);
      } catch {
        return RouteResponse.unauthorized(res, "Token inválido ou expirado");
      }
    };

    return descriptor;
  };
}

export const makeJwtToken = (payload: any) => {
  const secretKey = process.env.JWT || "default";
  return jwt.sign(payload, secretKey, { expiresIn: "1h" });
};
