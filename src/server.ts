import "reflect-metadata";
import swaggerUi from "swagger-ui-express";
import swaggerDocs from "./config/swagger";
import express from "express";
import { registerControllers } from "./config/routes";
import logger from "./config/logger";
import morganMiddleware from "./config/morgan";
import ignoreFavicon from "./config/favicon";
import listRoutes from "./config/routesLogger";

const app = express();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware para ignorar o favicon
app.use(ignoreFavicon);

// Middleware do Morgan com configuração de cores
app.use(morganMiddleware);

// Dynamically register all controllers in the 'controllers' directory
registerControllers(app, __dirname + "/controllers");

const port = 3000;

// Chama a função para listar as rotas

app.listen(3000, () => {
  logger.info(`Servidor rodando em http://localhost:${port}`);
  logger.info(`Documentação disponível em http://localhost:${port}/api-docs`);
  listRoutes(app);
});
