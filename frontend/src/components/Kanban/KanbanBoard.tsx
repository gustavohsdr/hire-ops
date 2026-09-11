// src/components/Kanban/KanbanBoard.tsx
import type { DropResult } from "@hello-pangea/dnd";
import { DragDropContext } from "@hello-pangea/dnd";
import { Box, ScrollArea } from "@mantine/core";
import React from "react";
import type { StatusVaga, Vaga } from "../../types/vaga";
import { KanbanColumn } from "./KanbanColumn";

interface KanbanBoardProps {
  vagas: Vaga[];
  onEditar: (vaga: Vaga) => void;
  onDuplicar: (vaga: Vaga) => void;
  onExcluir: (vaga: Vaga) => void;
  onMudarStatus: (id: number, novoStatus: StatusVaga) => void;
  pendingDrag?: { vaga: Vaga; novoStatus: StatusVaga } | null;
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
  onEditar,
  onDuplicar,
  onExcluir,
  onMudarStatus,
  pendingDrag,
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
      <ScrollArea type="hover" offsetScrollbars={false} scrollbars="x" scrollbarSize={8}>
        <Box style={{ display: "flex", gap: 16, flexWrap: "nowrap", paddingBottom: 12, alignItems: "flex-start" }}>
          {COLUNAS.map((status) => {
            let vagasDaColuna = vagas.filter((v) => v.status === status);
            if (pendingDrag && pendingDrag.novoStatus === status && !vagasDaColuna.some((v) => v.id === pendingDrag.vaga.id)) {
              vagasDaColuna = [...vagasDaColuna, { ...pendingDrag.vaga, status: pendingDrag.novoStatus } as Vaga];
            }
            const pendingId = pendingDrag && pendingDrag.novoStatus === status ? pendingDrag.vaga.id : null;
            return (
              <Box key={status} style={{ minWidth: 300, width: 300, flexShrink: 0 }}>
                <KanbanColumn
                  status={status}
                  vagas={vagasDaColuna}
                  onEditar={onEditar}
                  onDuplicar={onDuplicar}
                  onExcluir={onExcluir}
                  onMudarStatus={onMudarStatus}
                  pendingId={pendingId}
                />
              </Box>
            );
          })}
        </Box>
      </ScrollArea>
    </DragDropContext>
  );
};
