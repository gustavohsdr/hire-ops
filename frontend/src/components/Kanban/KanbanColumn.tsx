import { Droppable } from "@hello-pangea/dnd";
import { Paper, ScrollArea, Stack, Text } from "@mantine/core";
import React from "react";
import type { StatusVaga, SubEtapaVaga, Vaga } from "../../types/vaga";
import { VagaCard } from "./VagaCard";

interface KanbanColumnProps {
  status: StatusVaga;
  vagas: Vaga[];
  onEditar: (vaga: Vaga) => void;
  onDuplicar: (vaga: Vaga) => void;
  onExcluir: (vaga: Vaga) => void;
  onMudarStatus: (id: number, novoStatus: StatusVaga) => void;
  onDetalhes?: (vaga: Vaga) => void;
  onSubEtapa?: (id: number, subEtapa: SubEtapaVaga) => void;
  onDecisaoAdmissao?: (vaga: Vaga) => void;
  onVagaAtualizada?: (vaga: Vaga) => void;
  selectedIds?: number[];
  onToggleSelect?: (id: number) => void;
  pendingId?: number | null;
  isBulkActive?: boolean;
}

const scrollbarCss = `::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.15);border-radius:4px}::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,0.3)}`;

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  vagas,
  onEditar,
  onDuplicar,
  onExcluir,
  onMudarStatus,
  onDetalhes,
  onSubEtapa,
  onDecisaoAdmissao,
  onVagaAtualizada,
  selectedIds,
  onToggleSelect,
  pendingId,
  isBulkActive,
}) => {
  return (
    <Paper
      withBorder
      p="xs"
      radius="md"
      bg="var(--mantine-color-gray-0)"
      style={{ display: "flex", flexDirection: "column", height: "100%", maxHeight: "100%", minHeight: 0 }}
    >
      <Paper p="xs" radius="sm" withBorder mb="sm" bg="white" style={{ flexShrink: 0 }}>
        <Text fw={700} size="sm">
          {status} ({vagas.length})
        </Text>
      </Paper>

      <style>{scrollbarCss}</style>
      <ScrollArea type="hover" scrollbarSize={5} offsetScrollbars style={{ flex: 1, minHeight: 0, overflowX: "hidden" }}>
        <Droppable droppableId={status}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden",
                paddingRight: "6px",
                paddingLeft: "2px",
                minHeight: 0,
                borderRadius: 6,
                backgroundColor: snapshot.isDraggingOver ? "var(--mantine-color-blue-0)" : "transparent",
                transition: "background-color 0.2s ease",
                paddingBottom: 8,
              } as any}
            >
              {vagas.length === 0 && (
                <Paper
                  p="xl"
                  withBorder
                  style={{ borderStyle: "dashed", opacity: snapshot.isDraggingOver ? 0.2 : 1, transition: "opacity 0.2s ease" }}
                  bg="transparent"
                  mb="xs"
                >
                  <Text size="xs" c="dimmed" ta="center">Sem vagas</Text>
                </Paper>
              )}

              <Stack gap="xs">
                {vagas.map((vaga, index) => (
                  <VagaCard
                    key={vaga.id}
                    vaga={vaga}
                    index={index}
                    onEditar={onEditar}
                    onDuplicar={onDuplicar}
                    onExcluir={onExcluir}
                    onMudarStatus={onMudarStatus}
                    onDetalhes={onDetalhes}
                    onSubEtapa={onSubEtapa}
                    onDecisaoAdmissao={onDecisaoAdmissao}
                    onVagaAtualizada={onVagaAtualizada}
                    selected={selectedIds?.includes(vaga.id)}
                    onToggleSelect={onToggleSelect}
                    isPending={pendingId === vaga.id}
                    isBulkActive={!!isBulkActive}
                  />
                ))}
              </Stack>

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </ScrollArea>
    </Paper>
  );
};
