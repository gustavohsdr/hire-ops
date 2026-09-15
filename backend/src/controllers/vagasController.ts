import { Request, Response } from "express";
import { prisma } from "../database/prismaClient";

const mesmoDia = (a: Date, b: Date) => a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);

export class VagasController {
  // Listar todas as vagas para montar o Kanban
  async listar(req: Request, res: Response) {
    try {
      const vagas = await (prisma as any).vaga.findMany({
        include: { cargo: true },
        orderBy: { dataAbertura: "desc" },
      });
      return res.json(vagas);
    } catch (error) {
      console.error("[vagas.listar]", error);
      return res.status(500).json({ error: "Erro ao buscar vagas", detail: (error as any)?.message || String(error) });
    }
  }

  // Cadastrar nova vaga com Agrupamento Automático
  async criar(req: Request, res: Response) {
    try {
      const {
        cargoId,
        nivel,
        quantidade,
        unidade,
        departamento,
        centroDeCusto,
        gestor,
        recrutador,
        motivo,
        tipoContrato,
        cargaHoraria,
        slaDias,
        salario,
      } = req.body;

      const dia = new Date().toISOString().slice(0, 10);
      const inicioDia = new Date(dia + "T00:00:00.000Z");
      const fimDia = new Date(dia + "T00:00:00.000Z");
      fimDia.setUTCDate(fimDia.getUTCDate() + 1);
      const existente = await prisma.vaga.findFirst({
        where: {
          status: "Em Aberto",
          cargoId: String(cargoId),
          nivel,
          gestor,
          departamento,
          unidade,
          tipoContrato,
          dataAbertura: { gte: inicioDia, lt: fimDia },
        },
      });

      if (existente) {
        const atualizado = await prisma.vaga.update({
          where: { id: existente.id },
          data: { quantidade: existente.quantidade + (Number(quantidade) || 1) },
          include: { cargo: true },
        });
        return res.status(200).json({ agrupado: true, vaga: atualizado });
      }

      const novaVaga = await prisma.vaga.create({
        data: {
          cargoId: String(cargoId),
          nivel,
          quantidade: Number(quantidade) || 1,
          unidade,
          departamento,
          centroDeCusto: centroDeCusto != null ? String(centroDeCusto) : null,
          gestor,
          recrutador,
          motivo,
          tipoContrato,
          cargaHoraria,
          salario: salario != null ? Number(salario) : null,
          slaDias: Number(slaDias) || 30,
          status: "Em Aberto",
        },
        include: { cargo: true },
      });

      return res.status(201).json(novaVaga);
    } catch (error) {
      return res.status(400).json({ error: "Erro ao criar vaga" });
    }
  }

  // Remover uma vaga
  async excluir(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.vaga.delete({
        where: { id: Number(id) },
      });

      return res.status(204).send();
    } catch (error) {
      return res.status(404).json({ error: "Vaga não encontrada" });
    }
  }

  // Atualizar Status (Arrastar no Kanban) com Agrupamento Automático
  async atualizarStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { novoStatus } = req.body;

      const origem = await prisma.vaga.findUnique({ where: { id: Number(id) } });
      if (!origem) return res.status(404).json({ error: "Vaga não encontrada" });
      if (origem.status === novoStatus) return res.json(origem);

      const diaOrigem = origem.dataAbertura.toISOString().slice(0, 10);
      const gte = new Date(diaOrigem + "T00:00:00.000Z");
      const lt = new Date(diaOrigem + "T00:00:00.000Z");
      lt.setUTCDate(lt.getUTCDate() + 1);
      const alvo = await prisma.vaga.findFirst({
        where: {
          status: novoStatus,
          cargoId: origem.cargoId,
          nivel: origem.nivel,
          gestor: origem.gestor,
          departamento: origem.departamento,
          unidade: origem.unidade,
          tipoContrato: origem.tipoContrato,
          dataAbertura: { gte, lt },
          NOT: { id: Number(id) },
        },
      });

      if (alvo) {
        if (!mesmoDia(alvo.dataAbertura, origem.dataAbertura)) {
          const dataFinalizacao = novoStatus === "Concluído" ? new Date() : null;
          const vagaAtualizada = await prisma.vaga.update({
            where: { id: Number(id) },
            data: { status: novoStatus, dataFinalizacao },
            include: { cargo: true },
          });
          return res.json({ agrupado: false, vaga: vagaAtualizada });
        }
        const [destinoAtualizado] = await prisma.$transaction([
          prisma.vaga.update({
            where: { id: alvo.id },
            data: { quantidade: alvo.quantidade + origem.quantidade },
            include: { cargo: true },
          }),
          prisma.vaga.delete({ where: { id: Number(id) } }),
        ]);
        return res.json({ agrupado: true, destino: destinoAtualizado, removidoId: Number(id) });
      }

      const dataFinalizacao = novoStatus === "Concluído" ? new Date() : null;
      const subEtapaDefault = novoStatus === "Em Andamento" && !(origem as any).subEtapa ? { subEtapa: "ALINHAMENTO" } : {};
      const vagaAtualizada = await prisma.vaga.update({
        where: { id: Number(id) },
        data: { status: novoStatus, dataFinalizacao, ...subEtapaDefault } as any,
        include: { cargo: true },
      });
      return res.json({ agrupado: false, vaga: vagaAtualizada });
    } catch (error) {
      return res.status(400).json({ error: "Erro ao atualizar status da vaga" });
    }
  }

  async bulkAtualizarSubEtapa(req: Request, res: Response) {
    try {
      const { ids, subEtapa } = req.body;
      const allowed = ["ALINHAMENTO", "DIVULGACAO", "TRIAGEM", "VALIDACAO", "AGENDAMENTO", "ENTREVISTA", "ADMISSAO"];
      if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: "ids obrigatório" });
      if (!allowed.includes(String(subEtapa))) return res.status(400).json({ error: "subEtapa inválida" });
      await prisma.$transaction(ids.map((id: number) => prisma.vaga.update({ where: { id: Number(id) }, data: { subEtapa: String(subEtapa) } as any })));
      const updated = await prisma.vaga.findMany({ where: { id: { in: ids.map(Number) } }, include: { cargo: true } });
      return res.json(updated);
    } catch {
      return res.status(400).json({ error: "Erro no bulk sub-etapa" });
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        cargoId,
        nivel,
        quantidade,
        unidade,
        departamento,
        centroDeCusto,
        gestor,
        recrutador,
        motivo,
        tipoContrato,
        cargaHoraria,
        slaDias,
        salario,
        subEtapa,
        candidatoNome,
        dataAdmissao,
      } = req.body;
      const data: any = { nivel, unidade, departamento, gestor, recrutador, motivo, tipoContrato, cargaHoraria };
      if (cargoId !== undefined) data.cargoId = String(cargoId);
      if (quantidade !== undefined) data.quantidade = Number(quantidade);
      if (centroDeCusto !== undefined) data.centroDeCusto = centroDeCusto != null ? String(centroDeCusto) : null;
      if (salario !== undefined) data.salario = salario != null ? Number(salario) : null;
      if (slaDias !== undefined) data.slaDias = Number(slaDias);
      if (subEtapa !== undefined) data.subEtapa = subEtapa ? String(subEtapa) : null;
      if (candidatoNome !== undefined) data.candidatoNome = candidatoNome ? String(candidatoNome).trim() : null;
      if (dataAdmissao !== undefined) {
        if (!dataAdmissao) data.dataAdmissao = null;
        else {
          const s = String(dataAdmissao).split("T")[0] || "";
          const [y, m, d] = s.split("-").map(Number);
          data.dataAdmissao = new Date(Number(y), (Number(m) || 1) - 1, Number(d) || 1, 12, 0, 0);
        }
      }
      const vagaAtualizada = await prisma.vaga.update({
        where: { id: Number(id) },
        data,
        include: { cargo: true },
      });
      return res.json(vagaAtualizada);
    } catch (error) {
      return res.status(400).json({ error: "Erro ao atualizar vaga" });
    }
  }

  async atualizarSubEtapa(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { subEtapa } = req.body;
      const allowed = ["ALINHAMENTO", "DIVULGACAO", "TRIAGEM", "VALIDACAO", "AGENDAMENTO", "ENTREVISTA", "ADMISSAO"];
      if (!allowed.includes(String(subEtapa))) return res.status(400).json({ error: "subEtapa inválida" });
      const vaga = await prisma.vaga.update({ where: { id: Number(id) }, data: { subEtapa: String(subEtapa) } as any, include: { cargo: true } });
      return res.json(vaga);
    } catch {
      return res.status(400).json({ error: "Erro ao atualizar sub-etapa" });
    }
  }

  async salvarAdmissao(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { candidatoNome, dataAdmissao } = req.body;
      if (!candidatoNome?.trim()) return res.status(400).json({ error: "candidatoNome obrigatório" });
      let dataAdmissaoVal: Date | null = null;
      if (dataAdmissao) {
        const s = String(dataAdmissao).split("T")[0] || "";
        const [y, m, d] = s.split("-").map(Number);
        dataAdmissaoVal = new Date(Number(y), (Number(m) || 1) - 1, Number(d) || 1, 12, 0, 0);
      }
      const vaga = await prisma.vaga.update({
        where: { id: Number(id) },
        data: {
          candidatoNome: String(candidatoNome).trim(),
          dataAdmissao: dataAdmissaoVal,
          statusAdmissao: "PENDENTE",
        } as any,
        include: { cargo: true },
      });
      return res.json(vaga);
    } catch {
      return res.status(400).json({ error: "Erro ao salvar admissão" });
    }
  }

  async decisaoAdmissao(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { resultado, motivo, subEtapaRetorno } = req.body;
      const allowedRes = ["APROVADO", "REPROVADO", "DESISTENCIA"];
      if (!allowedRes.includes(String(resultado))) return res.status(400).json({ error: "resultado inválido" });
      const vaga = await prisma.vaga.findUnique({ where: { id: Number(id) } });
      if (!vaga) return res.status(404).json({ error: "Vaga não encontrada" });
      const candidatoNome = (vaga as any).candidatoNome;
      await (prisma as any).historicoAdmissao.create({
        data: {
          vagaId: Number(id),
          candidatoNome: candidatoNome || "—",
          resultado: String(resultado),
          motivo: motivo ? String(motivo).trim() : null,
        },
      });
      if (String(resultado) === "APROVADO") {
        const atualizada = await prisma.vaga.update({
          where: { id: Number(id) },
          data: { status: "Concluído", statusAdmissao: "APROVADO", subEtapa: "ADMISSAO", dataFinalizacao: new Date() } as any,
          include: { cargo: true },
        });
        return res.json(atualizada);
      }
      const retorno = subEtapaRetorno && ["ALINHAMENTO", "DIVULGACAO", "TRIAGEM", "VALIDACAO", "AGENDAMENTO", "ENTREVISTA"].includes(String(subEtapaRetorno)) ? String(subEtapaRetorno) : "TRIAGEM";
      const atualizada = await prisma.vaga.update({
        where: { id: Number(id) },
        data: {
          statusAdmissao: "REPROVADO",
          status: "Em Andamento",
          subEtapa: retorno,
          candidatoNome: null,
          dataAdmissao: null,
        } as any,
        include: { cargo: true },
      });
      return res.json(atualizada);
    } catch {
      return res.status(400).json({ error: "Erro na decisão de admissão" });
    }
  }

  async desmembrar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { quantidade, novoStatus } = req.body;
      const qtdMover = Number(quantidade);
      const vagaOrigem = await prisma.vaga.findUnique({
        where: { id: Number(id) },
      });
      if (!vagaOrigem) return res.status(404).json({ error: "Vaga não encontrada" });
      if (!Number.isInteger(qtdMover) || qtdMover <= 0 || qtdMover >= vagaOrigem.quantidade) {
        return res.status(400).json({ error: `Quantidade deve ser entre 1 e ${vagaOrigem.quantidade - 1}` });
      }
      if (!novoStatus) return res.status(400).json({ error: "novoStatus é obrigatório" });

      const diaO = vagaOrigem.dataAbertura.toISOString().slice(0, 10);
      const gteD = new Date(diaO + "T00:00:00.000Z");
      const ltD = new Date(diaO + "T00:00:00.000Z");
      ltD.setUTCDate(ltD.getUTCDate() + 1);
      const alvo = await prisma.vaga.findFirst({
        where: {
          status: novoStatus,
          cargoId: vagaOrigem.cargoId,
          nivel: vagaOrigem.nivel,
          gestor: vagaOrigem.gestor,
          departamento: vagaOrigem.departamento,
          unidade: vagaOrigem.unidade,
          tipoContrato: vagaOrigem.tipoContrato,
          dataAbertura: { gte: gteD, lt: ltD },
          NOT: { id: Number(id) },
        },
      });

      if (alvo) {
        if (!mesmoDia(alvo.dataAbertura, vagaOrigem.dataAbertura)) {
          const [vagaAtualizada, novaVaga] = await prisma.$transaction([
            prisma.vaga.update({
              where: { id: Number(id) },
              data: { quantidade: vagaOrigem.quantidade - qtdMover },
              include: { cargo: true },
            }),
            prisma.vaga.create({
              data: {
                cargoId: vagaOrigem.cargoId,
                nivel: vagaOrigem.nivel,
                quantidade: qtdMover,
                unidade: vagaOrigem.unidade,
                departamento: vagaOrigem.departamento,
                centroDeCusto: (vagaOrigem as any).centroDeCusto ?? null,
                gestor: vagaOrigem.gestor,
                recrutador: vagaOrigem.recrutador,
                motivo: vagaOrigem.motivo,
                tipoContrato: vagaOrigem.tipoContrato,
                cargaHoraria: vagaOrigem.cargaHoraria,
                slaDias: vagaOrigem.slaDias,
                status: novoStatus,
                dataFinalizacao: novoStatus === "Concluído" ? new Date() : null,
              },
              include: { cargo: true },
            }),
          ]);
          return res.status(201).json({ origem: vagaAtualizada, nova: novaVaga, agrupado: false });
        }
        const [origemAtualizada, destinoAtualizado] = await prisma.$transaction([
          prisma.vaga.update({
            where: { id: Number(id) },
            data: { quantidade: vagaOrigem.quantidade - qtdMover },
            include: { cargo: true },
          }),
          prisma.vaga.update({
            where: { id: alvo.id },
            data: { quantidade: alvo.quantidade + qtdMover },
            include: { cargo: true },
          }),
        ]);
        return res.status(200).json({ origem: origemAtualizada, destino: destinoAtualizado, agrupado: true });
      }

      const [vagaAtualizada, novaVaga] = await prisma.$transaction([
        prisma.vaga.update({
          where: { id: Number(id) },
          data: { quantidade: vagaOrigem.quantidade - qtdMover },
          include: { cargo: true },
        }),
        prisma.vaga.create({
          data: {
            cargoId: vagaOrigem.cargoId,
            nivel: vagaOrigem.nivel,
            quantidade: qtdMover,
            unidade: vagaOrigem.unidade,
            departamento: vagaOrigem.departamento,
            centroDeCusto: (vagaOrigem as any).centroDeCusto ?? null,
            gestor: vagaOrigem.gestor,
            recrutador: vagaOrigem.recrutador,
            motivo: vagaOrigem.motivo,
            tipoContrato: vagaOrigem.tipoContrato,
            cargaHoraria: vagaOrigem.cargaHoraria,
            slaDias: vagaOrigem.slaDias,
            status: novoStatus,
            dataFinalizacao: novoStatus === "Concluído" ? new Date() : null,
          },
          include: { cargo: true },
        }),
      ]);
      return res.status(201).json({ origem: vagaAtualizada, nova: novaVaga, agrupado: false });
    } catch (error) {
      return res.status(400).json({ error: "Erro ao desmembrar vaga" });
    }
  }
}
