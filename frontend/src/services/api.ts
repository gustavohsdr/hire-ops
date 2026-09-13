import type { AtualizarStatusResponse, Cargo, DesmembrarResponse, Gestor, NovaVagaPayload, StatusVaga, Unidade, Vaga } from "../types/vaga";
const API_BASE = "http://localhost:3333/api";
export const api = {
  async getVagas(): Promise<Vaga[]> { const res = await fetch(`${API_BASE}/vagas`); return res.json(); },
  async createVaga(data: NovaVagaPayload): Promise<Vaga> { const res = await fetch(`${API_BASE}/vagas`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); return res.json(); },
  async updateStatus(id: number, novoStatus: StatusVaga): Promise<AtualizarStatusResponse> { const res = await fetch(`${API_BASE}/vagas/${id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ novoStatus }) }); if (!res.ok) throw new Error(`Erro ao mover vaga: ${res.status}`); return res.json(); },
  async getCargos(): Promise<Cargo[]> { const res = await fetch(`${API_BASE}/cargos`); return res.json(); },
  async createCargo(data: Partial<Cargo> & { nome: string }): Promise<Cargo> { const res = await fetch(`${API_BASE}/cargos`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); return res.json(); },
  async updateCargo(id: string, data: Partial<Cargo>): Promise<Cargo> { const res = await fetch(`${API_BASE}/cargos/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); return res.json(); },
  async deleteCargo(id: string): Promise<void> { const res = await fetch(`${API_BASE}/cargos/${id}`, { method: "DELETE" }); if (!res.ok) throw new Error(String(res.status)); },
  async getUnidades(): Promise<Unidade[]> { const res = await fetch(`${API_BASE}/unidades`); return res.json(); },
  async createUnidade(nome: string): Promise<Unidade> { const res = await fetch(`${API_BASE}/unidades`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nome }) }); return res.json(); },
  async deleteUnidade(id: string): Promise<void> { const res = await fetch(`${API_BASE}/unidades/${id}`, { method: "DELETE" }); if (!res.ok) throw new Error(String(res.status)); },
  async getGestores(): Promise<Gestor[]> { const res = await fetch(`${API_BASE}/gestores`); return res.json(); },
  async createGestor(nome: string): Promise<Gestor> { const res = await fetch(`${API_BASE}/gestores`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nome }) }); return res.json(); },
  async deleteGestor(id: string): Promise<void> { const res = await fetch(`${API_BASE}/gestores/${id}`, { method: "DELETE" }); if (!res.ok) throw new Error(String(res.status)); },
  async updateVaga(id: number, data: NovaVagaPayload): Promise<Vaga> { const res = await fetch(`${API_BASE}/vagas/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); return res.json(); },
  async deleteVaga(id: number): Promise<void> { const res = await fetch(`${API_BASE}/vagas/${id}`, { method: "DELETE" }); if (!res.ok) throw new Error(`Erro ao remover vaga: ${res.status}`); },
  async desmembrarVaga(id: number, quantidade: number, novoStatus: StatusVaga): Promise<DesmembrarResponse> { const res = await fetch(`${API_BASE}/vagas/${id}/desmembrar`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quantidade, novoStatus }) }); if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || `Erro ao desmembrar vaga: ${res.status}`); } return res.json(); },
};
