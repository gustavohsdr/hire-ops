import { Router } from "express";
import { cargosController, gestoresController, unidadesController } from "./controllers/parametrosController";
import { VagasController } from "./controllers/vagasController";

const routes = Router();
const vagasController = new VagasController();

routes.get("/vagas", vagasController.listar);
routes.post("/vagas", vagasController.criar);
routes.put("/vagas/:id", vagasController.atualizar.bind(vagasController));
routes.delete("/vagas/:id", vagasController.excluir);
routes.patch("/vagas/:id/status", vagasController.atualizarStatus);
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

export { routes };
