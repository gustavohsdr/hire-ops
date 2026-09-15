import { Request, Response } from "express";
import { prisma } from "../database/prismaClient";

export const candidatosController = {
  async listarPorVaga(req: Request, res: Response) {
    try {
      const vagaId = Number(req.params.vagaId);
      if (!Number.isInteger(vagaId)) return res.status(400).json({ error: "vagaId inválido" });
      const candidatos = await prisma.candidato.findMany({ where: { vagaId }, orderBy: { createdAt: "desc" } });
      return res.json(candidatos);
    } catch {
      return res.status(500).json({ error: "Erro ao buscar candidatos" });
    }
  },

  async criar(req: Request, res: Response) {
    try {
      const { vagaId, nome, email, telefone, etapa, status } = req.body;
      if (!vagaId || !nome?.trim() || !email?.trim()) return res.status(400).json({ error: "vagaId, nome e email são obrigatórios" });
      const vaga = await prisma.vaga.findUnique({ where: { id: Number(vagaId) } });
      if (!vaga) return res.status(404).json({ error: "Vaga não encontrada" });
      const candidato = await prisma.candidato.create({
        data: {
          vagaId: Number(vagaId),
          nome: String(nome).trim(),
          email: String(email).trim(),
          telefone: telefone != null ? String(telefone).trim() || null : null,
          etapa: etapa ? String(etapa) : "Triagem",
          status: status ? String(status) : "Ativo",
        },
      });
      return res.status(201).json(candidato);
    } catch {
      return res.status(400).json({ error: "Erro ao criar candidato" });
    }
  },

  async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nome, email, telefone, etapa, status } = req.body;
      const data: any = {};
      if (nome !== undefined) data.nome = String(nome).trim();
      if (email !== undefined) data.email = String(email).trim();
      if (telefone !== undefined) data.telefone = telefone != null ? String(telefone).trim() || null : null;
      if (etapa !== undefined) data.etapa = String(etapa);
      if (status !== undefined) data.status = String(status);
      const candidato = await prisma.candidato.update({ where: { id: String(id) }, data });
      return res.json(candidato);
    } catch {
      return res.status(400).json({ error: "Erro ao atualizar candidato" });
    }
  },

  async remover(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.candidato.delete({ where: { id: String(id) } });
      return res.status(204).send();
    } catch {
      return res.status(404).json({ error: "Candidato não encontrado" });
    }
  },
};
