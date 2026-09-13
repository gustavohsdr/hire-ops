import { Draggable } from "@hello-pangea/dnd";
import { ActionIcon, Badge, Card, Group, Menu, Text, Tooltip } from "@mantine/core";
import { IconAlertTriangle, IconChevronRight, IconCopy, IconDotsVertical, IconMapPin, IconPencil, IconTrash, IconUser } from "@tabler/icons-react";
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

const STATUS_OPCOES: StatusVaga[] = ["Em Aberto", "Em Andamento", "Congelado", "Concluído", "Cancelado"];

export const VagaCard: React.FC<VagaCardProps> = ({ vaga, index, onEditar, onDuplicar, onExcluir, onMudarStatus, isPending }) => {
  const categoriaTexto = vaga.cargo?.categoria || (vaga as any).categoria || "ADMINISTRATIVO";
  const categoriaCor = categoriaTexto === "OPERACIONAL" ? "orange" : "blue";
  const dataAbertura = new Date(vaga.dataAbertura);
  const dataFim = vaga.dataFinalizacao ? new Date(vaga.dataFinalizacao) : new Date();
  const diasDecorridos = Math.floor((dataFim.getTime() - dataAbertura.getTime()) / (1000 * 3600 * 24));
  const diasRestantes = vaga.slaDias - diasDecorridos;
  const isFinalizada = vaga.status === "Concluído" || vaga.status === "Cancelado";
  let slaStatus: "VENCIDO" | "ATENCAO" | "OK" | "NEUTRO" = "NEUTRO";
  if (!isFinalizada) {
    if (diasRestantes < 0) slaStatus = "VENCIDO";
    else if (diasRestantes <= 5) slaStatus = "ATENCAO";
    else slaStatus = "OK";
  }
  let badgeColor = "gray";
  let borderLeft = "1px solid var(--mantine-color-gray-3)";
  if (!isFinalizada) {
    if (slaStatus === "VENCIDO") {
      badgeColor = "red";
      borderLeft = "4px solid var(--mantine-color-red-6)";
    } else if (slaStatus === "ATENCAO") {
      badgeColor = "yellow";
      borderLeft = "4px solid var(--mantine-color-yellow-6)";
    }
  }
  const textoSlaCompleto = isFinalizada ? (vaga.status === "Concluído" ? `FECHADO EM ${diasDecorridos}D` : "CANCELADO") : slaStatus === "VENCIDO" ? `ATRASADO HÁ ${Math.abs(diasRestantes)} DIAS` : `RESTAM: ${diasRestantes} DIAS`;

  return (
    <Draggable draggableId={String(vaga.id)} index={index} isDragDisabled={!!isPending}>
      {(provided) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          shadow="xs"
          padding="xs"
          radius="md"
          withBorder
          bg="white"
          opacity={isPending ? 0.6 : 1}
          style={{
            padding: 8,
            ...(provided.draggableProps.style as any),
            ...(isPending ? { borderStyle: "dashed" as const } : {}),
            borderLeft,
          }}
        >
          <Group justify="space-between" align="center" wrap="nowrap" mb={6}>
            <Tooltip label={categoriaTexto} position="top" radius="sm" withArrow={false}>
              <Badge color={categoriaCor} size="xs" variant="light" style={{ textTransform: "uppercase", letterSpacing: 0.4 }}>
                {categoriaTexto}
              </Badge>
            </Tooltip>
            <Group gap={6} wrap="nowrap">
              <Tooltip
                label={textoSlaCompleto}
                color="dark"
                fz={11}
                px={8}
                py={4}
                radius="sm"
                withArrow={false}
                transitionProps={{ transition: "fade", duration: 150 }}
                position="top"
                disabled={textoSlaCompleto.length < 18}
              >
                <Badge size="xs" color={badgeColor} variant="filled" leftSection={slaStatus === "VENCIDO" ? <IconAlertTriangle size={10} /> : undefined}>
                  {textoSlaCompleto}
                </Badge>
              </Tooltip>
              <Menu shadow="md" width={170} position="bottom-end">
                <Menu.Target>
                  <ActionIcon variant="subtle" color="gray" size="xs">
                    <IconDotsVertical size={14} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Ações</Menu.Label>
                  <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => onEditar(vaga)}>Editar</Menu.Item>
                  <Menu.Item leftSection={<IconCopy size={14} />} onClick={() => onDuplicar(vaga)}>Duplicar</Menu.Item>
                  <Menu.Sub>
                    <Menu.Sub.Target>
                      <Menu.Sub.Item rightSection={<IconChevronRight size={14} />}>Mover Status</Menu.Sub.Item>
                    </Menu.Sub.Target>
                    <Menu.Sub.Dropdown>
                      {STATUS_OPCOES.map((st) => (
                        <Menu.Item key={st} disabled={vaga.status === st} onClick={() => onMudarStatus(vaga.id, st)}>
                          {st}
                        </Menu.Item>
                      ))}
                    </Menu.Sub.Dropdown>
                  </Menu.Sub>
                  <Menu.Divider />
                  <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={() => onExcluir(vaga)}>Excluir</Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
          <Tooltip
            label={`${vaga.cargo?.nome || "Cargo"} - ${vaga.nivel}`}
            color="dark"
            fz={11}
            px={8}
            py={4}
            radius="sm"
            withArrow={false}
            transitionProps={{ transition: "fade", duration: 150 }}
            position="top"
            disabled={(vaga.cargo?.nome?.length ?? 0) < 32}
          >
            <Text fw={600} fz={13} lh={1.3} truncate>
              {vaga.cargo?.nome || "Cargo"} - {vaga.nivel}
            </Text>
          </Tooltip>
          <Group justify="space-between" align="center" wrap="nowrap" mt={6}>
            <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
              <Group gap={4} wrap="nowrap" style={{ minWidth: 0 }}>
                <IconUser size={14} color="var(--mantine-color-gray-5)" style={{ flexShrink: 0 }} />
                <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {vaga.gestor}
                </Text>
              </Group>
              <Group gap={4} wrap="nowrap" style={{ minWidth: 0 }}>
                <IconMapPin size={14} color="var(--mantine-color-gray-5)" style={{ flexShrink: 0 }} />
                <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {vaga.unidade}
                </Text>
              </Group>
            </Group>
            {vaga.quantidade > 1 && (
              <Badge size="xs" variant="light" color="blue" style={{ flexShrink: 0 }}>
                QTD: {vaga.quantidade}
              </Badge>
            )}
          </Group>
        </Card>
      )}
    </Draggable>
  );
};
