import { Droppable } from "@hello-pangea/dnd";
import { Paper, Stack, Text } from "@mantine/core";
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
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  vagas,
  onEditar,
  onDuplicar,
  onExcluir,
  onMudarStatus,
}) => {
  return (
    <Paper
      withBorder
      p="xs"
      radius="md"
      bg="var(--mantine-color-gray-0)"
      style={{ display: "flex", flexDirection: "column", minHeight: "650px" }}
    >
      <Paper p="xs" radius="sm" withBorder mb="md" bg="white">
        <Text fw={700} size="sm">
          {status} ({vagas.length})
        </Text>
      </Paper>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              flex: 1,
              minHeight: "500px",
              borderRadius: "6px",
              backgroundColor: snapshot.isDraggingOver
                ? "var(--mantine-color-blue-0)"
                : "transparent",
              transition: "background-color 0.2s ease",
            }}
          >
            {vagas.length === 0 && (
              <Paper
                p="xl"
                withBorder
                style={{
                  borderStyle: "dashed",
                  opacity: snapshot.isDraggingOver ? 0.2 : 1,
                  transition: "opacity 0.2s ease",
                }}
                bg="transparent"
                mb="xs"
              >
                <Text size="xs" c="dimmed" ta="center">
                  Sem vagas
                </Text>
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
                />
              ))}
            </Stack>

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </Paper>
  );
};
