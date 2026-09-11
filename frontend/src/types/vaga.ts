export type StatusVaga =
  | "Em Aberto"
  | "Em Andamento"
  | "Congelado"
  | "Concluído"
  | "Cancelado";

export interface Cargo {
  id: number;
  nome: string;
}

export interface Vaga {
  id: number;
  cargoId: number;
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
  status: StatusVaga;
  slaDias: number;
  dataAbertura: string;
  dataFinalizacao?: string | null;
}

export type NovaVagaPayload = Omit<
  Vaga,
  "id" | "cargo" | "dataAbertura" | "dataFinalizacao" | "status"
>;

export type AtualizarStatusResponse =
  | { agrupado: true; destino: Vaga; removidoId: number }
  | { agrupado: false; vaga: Vaga };

export type DesmembrarResponse =
  | { agrupado: true; origem: Vaga; destino: Vaga }
  | { agrupado: false; origem: Vaga; nova: Vaga };
