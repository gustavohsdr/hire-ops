export type StatusVaga = "Em Aberto" | "Em Andamento" | "Congelado" | "Concluído" | "Cancelado";
export interface Cargo {
  id: string;
  nome: string;
  categoria: "ADMINISTRATIVO" | "OPERACIONAL";
  departamento?: string | null;
  centroDeCusto?: string | null;
  slaPadrao: number;
  cargaHoraria?: string | null;
  salarioEstagio?: number | null;
  salarioJunior?: number | null;
  salarioPleno?: number | null;
  salarioSenior?: number | null;
  salarioCoordenador?: number | null;
  createdAt: string;
}
export interface Unidade { id: string; nome: string; createdAt: string; }
export interface Gestor { id: string; nome: string; createdAt: string; }
export interface Vaga {
  id: number;
  cargoId: string;
  cargo: Cargo;
  nivel: "Jr" | "Pleno" | "Senior" | "Estágio" | "Coordenador";
  quantidade: number;
  unidade: string;
  departamento: string;
  gestor: string;
  recrutador: string;
  motivo: "Aumento de Quadro" | "Substituição";
  tipoContrato: "CLT" | "PJ" | "Estágio" | "Temporário";
  cargaHoraria?: string;
  salario?: number | null;
  centroDeCusto?: string | null;
  status: StatusVaga;
  slaDias: number;
  dataAbertura: string;
  dataFinalizacao?: string | null;
}
export type NovaVagaPayload = Omit<Vaga, "id" | "cargo" | "dataAbertura" | "dataFinalizacao" | "status">;
export type AtualizarStatusResponse = { agrupado: true; destino: Vaga; removidoId: number } | { agrupado: false; vaga: Vaga };
export type DesmembrarResponse = { agrupado: true; origem: Vaga; destino: Vaga } | { agrupado: false; origem: Vaga; nova: Vaga };
