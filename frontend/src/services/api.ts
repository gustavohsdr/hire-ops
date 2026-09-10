// src/services/api.ts
import type { Cargo, NovaVagaPayload, StatusVaga, Vaga } from "../types/vaga";

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

  async updateStatus(id: number, novoStatus: StatusVaga): Promise<{ agrupado: boolean; vaga?: Vaga; destino?: Vaga; removidoId?: number }> {
    const res = await fetch(`${API_BASE}/vagas/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ novoStatus }),
    });
    if (!res.ok) throw new Error(`Erro ao mover vaga: ${res.status}`);
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
  // Atualizar dados de uma vaga existente (PUT)
  async updateVaga(id: number, data: NovaVagaPayload): Promise<Vaga> {
    const res = await fetch(`${API_BASE}/vagas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Remover uma vaga (DELETE)
  async deleteVaga(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/vagas/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error(`Erro ao remover vaga: ${res.status}`);
    }
  },

  async desmembrarVaga(id: number, quantidade: number, novoStatus: StatusVaga): Promise<{ origem: Vaga; nova?: Vaga; destino?: Vaga; agrupado: boolean }> {
    const res = await fetch(`${API_BASE}/vagas/${id}/desmembrar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantidade, novoStatus }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Erro ao desmembrar vaga: ${res.status}`);
    }
    return res.json();
  },
};
