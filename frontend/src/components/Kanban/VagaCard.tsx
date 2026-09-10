import { Draggable } from "@hello-pangea/dnd";
import { Badge, Card, Flex, Group, Select, Stack, Text } from "@mantine/core";
import React from "react";
import type { StatusVaga, Vaga } from "../../types/vaga";

interface VagaCardProps {
  vaga: Vaga;
  index: number; // 👈 Adicionamos o índice para o DnD
  onMudarStatus: (id: number, novoStatus: StatusVaga) => void;
}

const STATUS_OPCOES = [
  "Em Aberto",
  "Em Andamento",
  "Congelado",
  "Concluído",
  "Cancelado",
];

export const VagaCard: React.FC<VagaCardProps> = ({
  vaga,
  index,
  onMudarStatus,
}) => {
  const dataAbertura = new Date(vaga.dataAbertura);
  const diasEmAberto = Math.floor(
    (new Date().getTime() - dataAbertura.getTime()) / (1000 * 3600 * 24),
  );
  const estourouSLA = diasEmAberto > vaga.slaDias;

  return (
    <Draggable draggableId={String(vaga.id)} index={index}>
      {(provided) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          shadow="xs"
          padding="md"
          radius="md"
          withBorder
          mb="sm"
          bg="white"
        >
          <Group justify="space-between" mb="xs">
            <Text fw={600} size="sm">
              {vaga.cargo?.nome || "Cargo"} - {vaga.nivel}
            </Text>
            <Badge color="blue" variant="light">
              Qtd: {vaga.quantidade}
            </Badge>
          </Group>

          <Stack gap={4} mb="md">
            <Text size="xs" c="dimmed">
              📍 {vaga.unidade} • 🏢 {vaga.departamento}
            </Text>
            <Text size="xs" c="dimmed">
              👤 Gestor: {vaga.gestor}
            </Text>
          </Stack>

          <Flex justify="space-between" align="center" mb="sm">
            <Badge
              color={estourouSLA ? "red" : "gray"}
              variant="filled"
              size="sm"
            >
              ⏱️ {diasEmAberto}d / {vaga.slaDias}d SLA
            </Badge>
          </Flex>

          <Select
            label="Mover para"
            size="xs"
            value={vaga.status}
            onChange={(val) => val && onMudarStatus(vaga.id, val as StatusVaga)}
            data={STATUS_OPCOES}
          />
        </Card>
      )}
    </Draggable>
  );
};
