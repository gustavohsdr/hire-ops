import { Router } from "express";
import { candidatosController } from "./controllers/candidatosController";
import { cargosController, gestoresController, unidadesController } from "./controllers/parametrosController";
import { VagasController } from "./controllers/vagasController";

const routes = Router();
const vagasController = new VagasController();

routes.patch("/vagas/bulk-subetapa", vagasController.bulkAtualizarSubEtapa.bind(vagasController));
routes.get("/vagas", vagasController.listar);
routes.post("/vagas", vagasController.criar);
routes.put("/vagas/:id", vagasController.atualizar.bind(vagasController));
routes.delete("/vagas/:id", vagasController.excluir);
routes.patch("/vagas/:id/status", vagasController.atualizarStatus);
routes.patch("/vagas/:id/subetapa", vagasController.atualizarSubEtapa.bind(vagasController));
routes.patch("/vagas/:id/admissao", vagasController.salvarAdmissao.bind(vagasController));
routes.post("/vagas/:id/decisao-admissao", vagasController.decisaoAdmissao.bind(vagasController));
routes.post("/vagas/:id/desmembrar", vagasController.desmembrar.bind(vagasController));

routes.get("/cargos", cargosController.listar);
routes.post("/cargos", cargosController.criar);
routes.put("/cargos/:id", cargosController.atualizar);
routes.delete("/cargos/:id", cargosController.remover);

routes.get("/unidades", unidadesController.listar);
routes.post("/unidades", unidadesController.criar);
routes.delete("/unidades/:id", unidadesController.remover);

routes.get("/gestores", gestoresController.listar);
routes.post("/gestores", gestoresController.criar);
routes.delete("/gestores/:id", gestoresController.remover);

routes.get("/vagas/:vagaId/candidatos", candidatosController.listarPorVaga);
routes.post("/candidatos", candidatosController.criar);
routes.put("/candidatos/:id", candidatosController.atualizar);
routes.delete("/candidatos/:id", candidatosController.remover);

export { routes };
