import { Droppable } from "@hello-pangea/dnd";
import { Badge, Group, Paper, Stack, Text } from "@mantine/core";
import React from "react";
import type { StatusVaga, Vaga } from "../../types/vaga";
import { VagaCard } from "./VagaCard";

interface KanbanColumnProps {
  status: StatusVaga;
  vagas: Vaga[];
  onMudarStatus: (id: number, novoStatus: StatusVaga) => void;
}

const CORES_STATUS: Record<StatusVaga, string> = {
  "Em Aberto": "blue",
  "Em Andamento": "yellow",
  Congelado: "gray",
  Concluído: "green",
  Cancelado: "red",
};

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  vagas,
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
        <Group justify="space-between">
          <Text fw={700} size="xs" tt="uppercase" c="dimmed">
            {status}
          </Text>
          <Badge color={CORES_STATUS[status]} variant="light" size="sm" circle>
            {vagas.length}
          </Badge>
        </Group>
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
            {/* Esconde a caixa "Sem vagas" se a coluna tiver cards OU se o usuário estiver arrastando algo sobre ela */}
            {vagas.length === 0 && !snapshot.isDraggingOver ? (
              <Paper
                p="xl"
                withBorder
                style={{ borderStyle: "dashed" }}
                bg="transparent"
              >
                <Text size="xs" c="dimmed" ta="center">
                  Sem vagas
                </Text>
              </Paper>
            ) : (
              <Stack gap="xs">
                {vagas.map((vaga, index) => (
                  <VagaCard
                    key={vaga.id}
                    vaga={vaga}
                    index={index}
                    onMudarStatus={onMudarStatus}
                  />
                ))}
              </Stack>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </Paper>
  );
};
