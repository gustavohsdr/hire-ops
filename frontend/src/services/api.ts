import { Cargo, NovaVagaPayload, StatusVaga, Vaga } from "../types/vaga";

const API_BASE = "http://localhost:3333/api";

export const api = {
  // Buscar todas as vagas
  async getVagas(): Promise<Vaga[]> {
    const res = await fetch(`${API_BASE}/vagas`);
    return res.json();
  },

  // Criar nova vaga
  async createVaga(data: NovaVagaPayload): Promise<Vaga> {
    const res = await fetch(`${API_BASE}/vagas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Atualizar status ao mover no Kanban
  async updateStatus(id: number, novoStatus: StatusVaga): Promise<Vaga> {
    const res = await fetch(`${API_BASE}/vagas/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ novoStatus }),
    });
    return res.json();
  },

  // Listar e Criar Cargos
  async getCargos(): Promise<Cargo[]> {
    const res = await fetch(`${API_BASE}/cargos`);
    return res.json();
  },

  async createCargo(nome: string): Promise<Cargo> {
    const res = await fetch(`${API_BASE}/cargos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome }),
    });
    return res.json();
  },
};
