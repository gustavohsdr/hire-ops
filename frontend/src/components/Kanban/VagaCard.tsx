import { Draggable } from "@hello-pangea/dnd";
import {
  ActionIcon,
  Badge,
  Card,
  Group,
  Menu,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconBuilding,
  IconClock,
  IconCopy,
  IconDotsVertical,
  IconPencil,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import React from "react";
import type { StatusVaga, Vaga } from "../../types/vaga";

interface VagaCardProps {
  vaga: Vaga;
  index: number;
  onEditar: (vaga: Vaga) => void;
  onDuplicar: (vaga: Vaga) => void;
  onExcluir: (vaga: Vaga) => void;
  onMudarStatus: (id: number, novoStatus: StatusVaga) => void;
  isPending?: boolean;
}

const STATUS_OPCOES: StatusVaga[] = [
  "Em Aberto",
  "Em Andamento",
  "Congelado",
  "Concluído",
  "Cancelado",
];

export const VagaCard: React.FC<VagaCardProps> = ({
  vaga,
  index,
  onEditar,
  onDuplicar,
  onExcluir,
  onMudarStatus,
  isPending,
}) => {
  const dataAbertura = new Date(vaga.dataAbertura);
  const dataFim = vaga.dataFinalizacao
    ? new Date(vaga.dataFinalizacao)
    : new Date();

  const diasDecorridos = Math.floor(
    (dataFim.getTime() - dataAbertura.getTime()) / (1000 * 3600 * 24),
  );

  const diasRestantes = vaga.slaDias - diasDecorridos;
  const isConcluida = vaga.status === "Concluído";

  let badgeColor = "gray";
  if (isConcluida) {
    badgeColor = diasRestantes >= 0 ? "green" : "red";
  } else if (diasRestantes < 0) {
    badgeColor = "red";
  } else if (diasRestantes <= 5) {
    badgeColor = "yellow";
  }

  return (
    <Draggable draggableId={String(vaga.id)} index={index} isDragDisabled={!!isPending}>
      {(provided) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          shadow="xs"
          padding="sm"
          radius="md"
          withBorder
          mb="sm"
          bg="white"
          opacity={isPending ? 0.6 : 1}
          style={{
            borderStyle: isPending ? "dashed" : undefined,
            padding: 12,
            ...(provided.draggableProps.style as any),
          }}
        >
          {/* CABEÇALHO */}
          <Group justify="space-between" align="flex-start" mb={4} wrap="nowrap">
            <Text fw={700} size="sm" style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={`${vaga.cargo?.nome || "Cargo"} - ${vaga.nivel}`} lh={1.4}>
              {vaga.cargo?.nome || "Cargo"} - {vaga.nivel}
            </Text>

            <Group gap={4}>
              {vaga.quantidade > 1 && (
                <Badge size="xs" variant="light" color="blue">
                  QTD: {vaga.quantidade}
                </Badge>
              )}

              <Menu shadow="md" width={170} position="bottom-end">
                <Menu.Target>
                  <ActionIcon variant="subtle" color="gray" size="sm">
                    <IconDotsVertical size={16} />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>Ações</Menu.Label>
                  <Menu.Item
                    leftSection={<IconPencil size={14} />}
                    onClick={() => onEditar(vaga)}
                  >
                    Editar
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconCopy size={14} />}
                    onClick={() => onDuplicar(vaga)}
                  >
                    Duplicar
                  </Menu.Item>

                  <Menu.Divider />

                  <Menu.Label>Mover Status</Menu.Label>
                  {STATUS_OPCOES.map((st) => (
                    <Menu.Item
                      key={st}
                      disabled={vaga.status === st}
                      onClick={() => onMudarStatus(vaga.id, st)}
                    >
                      {st}
                    </Menu.Item>
                  ))}

                  <Menu.Divider />

                  <Menu.Item
                    color="red"
                    leftSection={<IconTrash size={14} />}
                    onClick={() => onExcluir(vaga)}
                  >
                    Excluir
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>

          {/* INFORMAÇÕES DE DEPARTAMENTO E GESTOR */}
          <Stack gap={2} mb="xs">
            <Group gap={4} wrap="nowrap">
              <IconBuilding size={14} color="gray" />
              <Text size="xs" c="dimmed">
                {vaga.departamento} • {vaga.unidade}
              </Text>
            </Group>

            <Group gap={4} wrap="nowrap">
              <IconUser size={14} color="gray" />
              <Text size="xs" c="dimmed">
                Gestor: {vaga.gestor}
              </Text>
            </Group>
          </Stack>

          {/* INDICADOR DE SLA E PRAZO */}
          <Group justify="space-between" align="center">
            <Group gap={4}>
              <IconClock size={14} color="gray" />
              <Text size="xs" c="gray.7" fw={500}>
                SLA: {vaga.slaDias}d
              </Text>
            </Group>

            <Badge size="xs" color={badgeColor} variant="filled">
              {isConcluida
                ? `FECHADO EM ${diasDecorridos}D`
                : diasRestantes < 0
                  ? `ATRASADO ${Math.abs(diasRestantes)}D`
                  : `RESTAM: ${diasRestantes} DIAS`}
            </Badge>
          </Group>
        </Card>
      )}
    </Draggable>
  );
};
