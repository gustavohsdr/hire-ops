import { Droppable } from "@hello-pangea/dnd";
import { Paper, ScrollArea, Stack, Text } from "@mantine/core";
import React from "react";
import type { StatusVaga, Vaga } from "../../types/vaga";
import { VagaCard } from "./VagaCard";

interface KanbanColumnProps {
  status: StatusVaga;
  vagas: Vaga[];
  onEditar: (vaga: Vaga) => void;
  onDuplicar: (vaga: Vaga) => void;
  onExcluir: (vaga: Vaga) => void;
  onMudarStatus: (id: number, novoStatus: StatusVaga) => void;
  pendingId?: number | null;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  vagas,
  onEditar,
  onDuplicar,
  onExcluir,
  onMudarStatus,
  pendingId,
}) => {
  return (
    <Paper
      withBorder
      p="xs"
      radius="md"
      bg="var(--mantine-color-gray-0)"
      style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 300px)", maxHeight: 680, minHeight: 380 }}
    >
      <Paper p="xs" radius="sm" withBorder mb="sm" bg="white" style={{ flexShrink: 0 }}>
        <Text fw={700} size="sm">
          {status} ({vagas.length})
        </Text>
      </Paper>

      <ScrollArea type="hover" scrollbarSize={6} offsetScrollbars={false} style={{ flex: 1, minHeight: 0 }}>
        <Droppable droppableId={status}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{
                minHeight: 120,
                borderRadius: 6,
                backgroundColor: snapshot.isDraggingOver ? "var(--mantine-color-blue-0)" : "transparent",
                transition: "background-color 0.2s ease",
                paddingBottom: 8,
              }}
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
                    isPending={pendingId === vaga.id}
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
