// src/components/Kanban/KanbanBoard.tsx
import type { DropResult } from "@hello-pangea/dnd";
import { DragDropContext } from "@hello-pangea/dnd";
import { SimpleGrid } from "@mantine/core";
import React from "react";
import type { StatusVaga, Vaga } from "../../types/vaga";
import { KanbanColumn } from "./KanbanColumn";

interface KanbanBoardProps {
  vagas: Vaga[];
  onMudarStatus: (id: number, novoStatus: StatusVaga) => void;
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
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const vagaId = Number(draggableId);
    const novoStatus = destination.droppableId as StatusVaga;

    onMudarStatus(vagaId, novoStatus);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 5 }} spacing="md">
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
      </SimpleGrid>
    </DragDropContext>
  );
};
