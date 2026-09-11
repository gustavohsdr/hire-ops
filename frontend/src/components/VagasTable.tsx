import { ActionIcon, Badge, Group, Menu, Table, Text } from "@mantine/core";
import { IconDotsVertical, IconPencil, IconTrash } from "@tabler/icons-react";
import type { StatusVaga, Vaga } from "../types/vaga";

const corStatus: Record<StatusVaga, string> = {
  "Em Aberto": "blue",
  "Em Andamento": "yellow",
  Congelado: "gray",
  Concluído: "green",
  Cancelado: "red",
};

function slaInfo(vaga: Vaga) {
  const ini = new Date(vaga.dataAbertura);
  const fim = vaga.dataFinalizacao ? new Date(vaga.dataFinalizacao) : new Date();
  const dias = Math.floor((fim.getTime() - ini.getTime()) / (1000 * 3600 * 24));
  const resto = vaga.slaDias - dias;
  const concluida = vaga.status === "Concluído";
  let label = concluida ? `FECHADO EM ${dias}D` : resto < 0 ? `ATRASADO ${Math.abs(resto)}D` : `RESTAM ${resto}D`;
  let color = concluida ? (resto >= 0 ? "green" : "red") : resto < 0 ? "red" : resto <= 5 ? "yellow" : "gray";
  return { label, color, resto };
}

interface Props {
  vagas: Vaga[];
  onEditar: (v: Vaga) => void;
  onExcluir: (v: Vaga) => void;
}

export function VagasTable({ vagas, onEditar, onExcluir }: Props) {
  return (
    <Table striped highlightOnHover withTableBorder withColumnBorders>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Cargo / Vaga</Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th>Unidade</Table.Th>
          <Table.Th>Gestor</Table.Th>
          <Table.Th>Qtd.</Table.Th>
          <Table.Th>SLA</Table.Th>
          <Table.Th>Ações</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {vagas.length === 0 ? (
          <Table.Tr><Table.Td colSpan={7}><Text c="dimmed" ta="center">Sem vagas</Text></Table.Td></Table.Tr>
        ) : (
          vagas.map((v) => {
            const sla = slaInfo(v);
            return (
              <Table.Tr key={v.id}>
                <Table.Td><Text fw={600} size="sm">{v.cargo.nome} - {v.nivel}</Text><Text size="xs" c="dimmed">{v.departamento}</Text></Table.Td>
                <Table.Td><Badge color={corStatus[v.status]} size="xs">{v.status}</Badge></Table.Td>
                <Table.Td><Text size="sm">{v.unidade}</Text></Table.Td>
                <Table.Td><Text size="sm">{v.gestor}</Text></Table.Td>
                <Table.Td><Text size="sm">{v.quantidade}</Text></Table.Td>
                <Table.Td>
                  <Badge color={sla.color} size="xs" variant="filled">{sla.label}</Badge>
                  <Text size="xs" c="dimmed">SLA {v.slaDias}d</Text>
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <ActionIcon variant="subtle" onClick={() => onEditar(v)}><IconPencil size={16} /></ActionIcon>
                    <Menu shadow="md" position="bottom-end">
                      <Menu.Target><ActionIcon variant="subtle"><IconDotsVertical size={16} /></ActionIcon></Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={() => onExcluir(v)}>Excluir</Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </Table.Td>
              </Table.Tr>
            );
          })
        )}
      </Table.Tbody>
    </Table>
  );
}
