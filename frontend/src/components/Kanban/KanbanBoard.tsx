import type { DropResult } from "@hello-pangea/dnd";
import { DragDropContext } from "@hello-pangea/dnd";
import { Box } from "@mantine/core";
import React, { useState } from "react";
import type { StatusVaga, SubEtapaVaga, Vaga } from "../../types/vaga";
import { KanbanColumn } from "./KanbanColumn";
import { BulkActionToolbar } from "./BulkActionToolbar";
import { api } from "../../services/api";

interface KanbanBoardProps {
  vagas: Vaga[];
  onEditar: (vaga: Vaga) => void;
  onDuplicar: (vaga: Vaga) => void;
  onExcluir: (vaga: Vaga) => void;
  onMudarStatus: (id: number, novoStatus: StatusVaga) => void;
  onDetalhes?: (vaga: Vaga) => void;
  onSubEtapa?: (id: number, subEtapa: SubEtapaVaga) => void;
  onDecisaoAdmissao?: (vaga: Vaga) => void;
  onVagaAtualizada?: (vaga: Vaga) => void;
  onBulkSubEtapa?: (ids: number[], subEtapa: SubEtapaVaga) => Promise<void>;
  pendingDrag?: { vaga: Vaga; novoStatus: StatusVaga } | null;
}

const COLUNAS: StatusVaga[] = ["Em Aberto", "Em Andamento", "Congelado", "Concluído", "Cancelado"];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ vagas, onEditar, onDuplicar, onExcluir, onMudarStatus, onDetalhes, onSubEtapa, onDecisaoAdmissao, onVagaAtualizada, onBulkSubEtapa, pendingDrag }) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const toggleSelect = (id: number) => setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const handleBulk = async (subEtapa: SubEtapaVaga) => {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    try {
      if (onBulkSubEtapa) await onBulkSubEtapa(selectedIds, subEtapa);
      else {
        await api.bulkUpdateSubEtapa(selectedIds, subEtapa);
      }
      setSelectedIds([]);
    } finally {
      setBulkLoading(false);
    }
  };
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    const vagaId = Number(draggableId);
    const novoStatus = destination.droppableId as StatusVaga;
    onMudarStatus(vagaId, novoStatus);
  };
  return (
    <Box style={{ flex: 1, display: "flex", gap: "md", overflowX: "auto", overflowY: "hidden", minHeight: 0, position: "relative" }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Box style={{ display: "flex", gap: 16, flexWrap: "nowrap", paddingBottom: 12, alignItems: "stretch" }}>
          {COLUNAS.map((status) => {
            let vagasDaColuna = vagas.filter((v) => v.status === status);
            if (pendingDrag && pendingDrag.novoStatus === status && !vagasDaColuna.some((v) => v.id === pendingDrag.vaga.id)) {
              vagasDaColuna = [...vagasDaColuna, { ...pendingDrag.vaga, status: pendingDrag.novoStatus } as Vaga];
            }
            const pendingId = pendingDrag && pendingDrag.novoStatus === status ? pendingDrag.vaga.id : null;
            return (
              <Box key={status} style={{ minWidth: 300, width: 300, flexShrink: 0, display: "flex", flexDirection: "column", minHeight: 0 }}>
                <KanbanColumn
                  status={status}
                  vagas={vagasDaColuna}
                  onEditar={onEditar}
                  onDuplicar={onDuplicar}
                  onExcluir={onExcluir}
                  onMudarStatus={onMudarStatus}
                  onDetalhes={onDetalhes}
                  onSubEtapa={onSubEtapa}
                  onDecisaoAdmissao={onDecisaoAdmissao}
                  onVagaAtualizada={onVagaAtualizada}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelect}
                  pendingId={pendingId}
                  isBulkActive={selectedIds.length > 0}
                />
              </Box>
            );
          })}
        </Box>
      </DragDropContext>
      <BulkActionToolbar count={selectedIds.length} onClear={() => setSelectedIds([])} onAlterar={handleBulk} loading={bulkLoading} />
    </Box>
  );
};
