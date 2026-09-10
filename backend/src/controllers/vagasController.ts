import { Request, Response } from "express";
import { prisma } from "../database/prismaClient";

export class VagasController {
  // Listar todas as vagas para montar o Kanban
  async listar(req: Request, res: Response) {
    try {
      const vagas = await prisma.vaga.findMany({
        include: { cargo: true },
        orderBy: { dataAbertura: "desc" },
      });
      return res.json(vagas);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar vagas" });
    }
  }

  // Cadastrar nova vaga
  async criar(req: Request, res: Response) {
    try {
      const {
        cargoId,
        nivel,
        quantidade,
        unidade,
        departamento,
        gestor,
        recrutador,
        motivo,
        tipoContrato,
        cargaHoraria,
        slaDias,
      } = req.body;

      const novaVaga = await prisma.vaga.create({
        data: {
          cargoId: Number(cargoId),
          nivel,
          quantidade: Number(quantidade) || 1,
          unidade,
          departamento,
          gestor,
          recrutador,
          motivo,
          tipoContrato,
          cargaHoraria,
          slaDias: Number(slaDias) || 30,
          status: "Em Aberto",
        },
      });

      return res.status(201).json(novaVaga);
    } catch (error) {
      return res.status(400).json({ error: "Erro ao criar vaga" });
    }
  }

  // Atualizar Status (Arrastar no Kanban)
  async atualizarStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { novoStatus } = req.body;

      // Automação: Se concluído, registra a data final; se reaberta, limpa a data
      const dataFinalizacao = novoStatus === "Concluído" ? new Date() : null;

      const vagaAtualizada = await prisma.vaga.update({
        where: { id: Number(id) },
        data: {
          status: novoStatus,
          dataFinalizacao,
        },
      });

      return res.json(vagaAtualizada);
    } catch (error) {
      return res
        .status(400)
        .json({ error: "Erro ao atualizar status da vaga" });
    }
  }
}
