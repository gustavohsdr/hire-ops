import { ActionIcon, Badge, Button, Group, Stack, Table, Tabs, Text, TextInput, Tooltip } from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { CargoModal } from "../components/Modals/CargoModal";
import { api } from "../services/api";
import type { Cargo, Gestor, Unidade } from "../types/vaga";

export function ConfiguracoesPage() {
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [gestores, setGestores] = useState<Gestor[]>([]);
  const [cargoModal, setCargoModal] = useState(false);
  const [editing, setEditing] = useState<Cargo | null>(null);
  const [novaUnidade, setNovaUnidade] = useState("");
  const [novoGestor, setNovoGestor] = useState("");

  const load = async () => {
    const [c, u, g] = await Promise.all([api.getCargos(), api.getUnidades(), api.getGestores()]);
    setCargos(c); setUnidades(u); setGestores(g);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setCargoModal(true); };
  const openEdit = (c: Cargo) => { setEditing(c); setCargoModal(true); };
  const handleSaveCargo = async (payload: any) => {
    if (editing) await api.updateCargo(editing.id, payload);
    else await api.createCargo(payload);
    load();
  };

  return (
    <Stack gap="md">
      <Text fw={700} size="lg">Configurações</Text>
      <Tabs defaultValue="cargos">
        <Tabs.List>
          <Tabs.Tab value="cargos">Cargos</Tabs.Tab>
          <Tabs.Tab value="unidades">Unidades</Tabs.Tab>
          <Tabs.Tab value="gestores">Gestores</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="cargos" pt="md">
          <Group justify="space-between" mb="sm">
            <Text size="sm" fw={600}>Cargos</Text>
            <Button size="xs" leftSection={<IconPlus size={14} />} onClick={openCreate}>Novo Cargo</Button>
          </Group>
          <Table withTableBorder withColumnBorders>
            <Table.Thead><Table.Tr><Table.Th>Nome</Table.Th><Table.Th>Categoria</Table.Th><Table.Th>SLA</Table.Th><Table.Th>Ações</Table.Th></Table.Tr></Table.Thead>
            <Table.Tbody>
              {cargos.map((c) => (
                <Table.Tr key={c.id}>
                  <Table.Td><Text size="sm">{c.nome}</Text></Table.Td>
                  <Table.Td><Tooltip label={c.categoria} position="top" radius="sm" withArrow={false}><Badge color={c.categoria === "OPERACIONAL" ? "orange" : "blue"} size="xs" variant="light">{c.categoria}</Badge></Tooltip></Table.Td>
                  <Table.Td><Text size="sm">{c.slaPadrao}d</Text></Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button size="compact-xs" variant="light" onClick={() => openEdit(c)}>Editar</Button>
                      <ActionIcon color="red" variant="subtle" onClick={async () => { await api.deleteCargo(c.id); load(); }}><IconTrash size={14} /></ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>
        <Tabs.Panel value="unidades" pt="md">
          <Group gap="sm" mb="sm">
            <TextInput placeholder="Nova unidade" value={novaUnidade} onChange={(e) => setNovaUnidade(e.target.value)} size="sm" style={{ flex: 1 }} />
            <Button size="sm" onClick={async () => { if (!novaUnidade.trim()) return; await api.createUnidade(novaUnidade.trim()); setNovaUnidade(""); load(); }}>Adicionar</Button>
          </Group>
          <Table withTableBorder withColumnBorders>
            <Table.Thead><Table.Tr><Table.Th>Nome</Table.Th><Table.Th>Ações</Table.Th></Table.Tr></Table.Thead>
            <Table.Tbody>{unidades.map((u) => (<Table.Tr key={u.id}><Table.Td>{u.nome}</Table.Td><Table.Td><ActionIcon color="red" variant="subtle" onClick={async () => { await api.deleteUnidade(u.id); load(); }}><IconTrash size={14} /></ActionIcon></Table.Td></Table.Tr>))}</Table.Tbody>
          </Table>
        </Tabs.Panel>
        <Tabs.Panel value="gestores" pt="md">
          <Group gap="sm" mb="sm">
            <TextInput placeholder="Novo gestor" value={novoGestor} onChange={(e) => setNovoGestor(e.target.value)} size="sm" style={{ flex: 1 }} />
            <Button size="sm" onClick={async () => { if (!novoGestor.trim()) return; await api.createGestor(novoGestor.trim()); setNovoGestor(""); load(); }}>Adicionar</Button>
          </Group>
          <Table withTableBorder withColumnBorders>
            <Table.Thead><Table.Tr><Table.Th>Nome</Table.Th><Table.Th>Ações</Table.Th></Table.Tr></Table.Thead>
            <Table.Tbody>{gestores.map((g) => (<Table.Tr key={g.id}><Table.Td>{g.nome}</Table.Td><Table.Td><ActionIcon color="red" variant="subtle" onClick={async () => { await api.deleteGestor(g.id); load(); }}><IconTrash size={14} /></ActionIcon></Table.Td></Table.Tr>))}</Table.Tbody>
          </Table>
        </Tabs.Panel>
      </Tabs>
      <CargoModal opened={cargoModal} onClose={() => setCargoModal(false)} cargo={editing} onSave={handleSaveCargo} />
    </Stack>
  );
}
