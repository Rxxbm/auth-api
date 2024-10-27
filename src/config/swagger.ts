import swaggerJsDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Api de Autenticação da Focus",
      version: "1.0.0",
      description: "Documentação da API",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./src/controllers/*.ts"], // Caminho para os arquivos onde a documentação será gerada
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
export default swaggerDocs;
