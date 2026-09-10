import React from "react";
import { StatusVaga, Vaga } from "../../types/vaga";
import { KanbanColumn } from "./KanbanColumn";

interface KanbanBoardProps {
  vagas: Vaga[];
  onMudarStatus: (id: number, status: StatusVaga) => void;
}

const COLUNAS: StatusVaga[] = [
  "Em Aberto",
  "Em Andamento",
  "Congelado",
  "Concluído",
  "Cancelado",
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  vagas,
  onMudarStatus,
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: "16px",
        padding: "20px",
      }}
    >
      {COLUNAS.map((status) => {
        const vagasDaColuna = vagas.filter((v) => v.status === status);
        return (
          <KanbanColumn
            key={status}
            status={status}
            vagas={vagasDaColuna}
            onMudarStatus={onMudarStatus}
          />
        );
      })}
    </div>
  );
};
