import { Router } from "express";
import { VagasController } from "./controllers/vagasController";
import { prisma } from "./database/prismaClient";

const routes = Router();
const vagasController = new VagasController();

// Rotas de Vagas
routes.get("/vagas", vagasController.listar);
routes.post("/vagas", vagasController.criar);
routes.put("/vagas/:id", vagasController.atualizar.bind(vagasController));
routes.delete("/vagas/:id", vagasController.excluir);
routes.patch("/vagas/:id/status", vagasController.atualizarStatus);
routes.post("/vagas/:id/desmembrar", vagasController.desmembrar.bind(vagasController));

// Rotas auxiliares de Cargos para os Selects do Front
routes.get("/cargos", async (req, res) => {
  const cargos = await prisma.cargo.findMany({ orderBy: { nome: "asc" } });
  return res.json(cargos);
});

routes.post("/cargos", async (req, res) => {
  const { nome } = req.body;
  const novoCargo = await prisma.cargo.create({ data: { nome } });
  return res.json(novoCargo);
});

export { routes };
