import { Request, Response } from "express";
import { prisma } from "../database/prismaClient";

export const unidadesController = {
  async listar(_req: Request, res: Response) {
    const data = await prisma.unidade.findMany({ orderBy: { nome: "asc" } });
    return res.json(data);
  },
  async criar(req: Request, res: Response) {
    const { nome } = req.body;
    if (!nome?.trim()) return res.status(400).json({ error: "nome obrigatório" });
    const u = await prisma.unidade.create({ data: { nome: nome.trim() } });
    return res.status(201).json(u);
  },
  async remover(req: Request, res: Response) {
    await prisma.unidade.delete({ where: { id: String(req.params.id) } });
    return res.status(204).send();
  },
};

export const gestoresController = {
  async listar(_req: Request, res: Response) {
    const data = await prisma.gestor.findMany({ orderBy: { nome: "asc" } });
    return res.json(data);
  },
  async criar(req: Request, res: Response) {
    const { nome } = req.body;
    if (!nome?.trim()) return res.status(400).json({ error: "nome obrigatório" });
    const g = await prisma.gestor.create({ data: { nome: nome.trim() } });
    return res.status(201).json(g);
  },
  async remover(req: Request, res: Response) {
    await prisma.gestor.delete({ where: { id: String(req.params.id) } });
    return res.status(204).send();
  },
};

export const cargosController = {
  async listar(_req: Request, res: Response) {
    const data = await prisma.cargo.findMany({ orderBy: { nome: "asc" } });
    return res.json(data);
  },
  async criar(req: Request, res: Response) {
    const { nome, categoria, departamento, centroDeCusto, slaPadrao, cargaHoraria, salarioEstagio, salarioJunior, salarioPleno, salarioSenior, salarioCoordenador } = req.body;
    if (!nome?.trim()) return res.status(400).json({ error: "nome obrigatório" });
    const c = await prisma.cargo.create({
      data: {
        nome: nome.trim(),
        categoria: categoria || "ADMINISTRATIVO",
        departamento: departamento != null ? String(departamento).trim() || null : null,
        centroDeCusto: centroDeCusto != null ? String(centroDeCusto).trim() || null : null,
        slaPadrao: slaPadrao != null ? Number(slaPadrao) : 30,
        cargaHoraria: cargaHoraria != null ? String(cargaHoraria) : null,
        salarioEstagio: salarioEstagio != null ? Number(salarioEstagio) : null,
        salarioJunior: salarioJunior != null ? Number(salarioJunior) : null,
        salarioPleno: salarioPleno != null ? Number(salarioPleno) : null,
        salarioSenior: salarioSenior != null ? Number(salarioSenior) : null,
        salarioCoordenador: salarioCoordenador != null ? Number(salarioCoordenador) : null,
      },
    });
    return res.status(201).json(c);
  },
  async atualizar(req: Request, res: Response) {
    const { nome, categoria, departamento, centroDeCusto, slaPadrao, cargaHoraria, salarioEstagio, salarioJunior, salarioPleno, salarioSenior, salarioCoordenador } = req.body;
    const c = await prisma.cargo.update({
      where: { id: String(req.params.id) },
      data: {
        nome: nome != null ? String(nome).trim() : undefined,
        categoria,
        departamento: departamento !== undefined ? (departamento != null ? String(departamento).trim() || null : null) : undefined,
        centroDeCusto: centroDeCusto !== undefined ? (centroDeCusto != null ? String(centroDeCusto).trim() || null : null) : undefined,
        slaPadrao: slaPadrao != null ? Number(slaPadrao) : undefined,
        cargaHoraria: cargaHoraria !== undefined ? (cargaHoraria != null ? String(cargaHoraria) : null) : undefined,
        salarioEstagio: salarioEstagio !== undefined ? (salarioEstagio != null ? Number(salarioEstagio) : null) : undefined,
        salarioJunior: salarioJunior !== undefined ? (salarioJunior != null ? Number(salarioJunior) : null) : undefined,
        salarioPleno: salarioPleno !== undefined ? (salarioPleno != null ? Number(salarioPleno) : null) : undefined,
        salarioSenior: salarioSenior !== undefined ? (salarioSenior != null ? Number(salarioSenior) : null) : undefined,
        salarioCoordenador: salarioCoordenador !== undefined ? (salarioCoordenador != null ? Number(salarioCoordenador) : null) : undefined,
      },
    });
    return res.json(c);
  },
  async remover(req: Request, res: Response) {
    await prisma.cargo.delete({ where: { id: String(req.params.id) } });
    return res.status(204).send();
  },
};
