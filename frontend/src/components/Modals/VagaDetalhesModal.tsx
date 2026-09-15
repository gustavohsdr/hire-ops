import { ActionIcon, Badge, Box, Button, Divider, Group, Modal, ScrollArea, Select, Stack, Table, Tabs, Text, TextInput, SimpleGrid, Paper } from "@mantine/core";
import { IconEye, IconEyeOff, IconPlus, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import type { Candidato, EtapaCandidato, Vaga } from "../../types/vaga";

interface Props {
  vaga: Vaga | null;
  opened: boolean;
  onClose: () => void;
}

const ETAPAS: EtapaCandidato[] = ["Triagem", "Entrevista RH", "Entrevista Gestor", "Proposta", "Contratado"];

const etapaColor: Record<string, string> = {
  Triagem: "gray",
  "Entrevista RH": "blue",
  "Entrevista Gestor": "violet",
  Proposta: "yellow",
  Contratado: "green",
};

export function VagaDetalhesModal({ vaga, opened, onClose }: Props) {
  const [tab, setTab] = useState<string | null>("visao");
  const [showSalario, setShowSalario] = useState(false);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [loadingCand, setLoadingCand] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [etapa, setEtapa] = useState<EtapaCandidato>("Triagem");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (opened && vaga) {
      setTab("visao");
      setShowSalario(false);
      setShowForm(false);
      setNome("");
      setEmail("");
      setTelefone("");
      setEtapa("Triagem");
      carregar();
    }
  }, [opened, vaga?.id]);

  const carregar = async () => {
    if (!vaga) return;
    setLoadingCand(true);
    try {
      const data = await api.getCandidatos(vaga.id);
      setCandidatos(data);
    } catch {
      setCandidatos([]);
    } finally {
      setLoadingCand(false);
    }
  };

  const handleCreate = async () => {
    if (!vaga || !nome.trim() || !email.trim() || saving) return;
    setSaving(true);
    try {
      const novo = await api.createCandidato({ vagaId: vaga.id, nome: nome.trim(), email: email.trim(), telefone: telefone.trim() || null, etapa });
      setCandidatos((prev) => [novo, ...prev]);
      setNome("");
      setEmail("");
      setTelefone("");
      setEtapa("Triagem");
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleEtapaChange = async (c: Candidato, novaEtapa: string) => {
    try {
      const atualizado = await api.updateCandidato(c.id, { etapa: novaEtapa as EtapaCandidato });
      setCandidatos((prev) => prev.map((x) => (x.id === c.id ? atualizado : x)));
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteCandidato(id);
      setCandidatos((prev) => prev.filter((x) => x.id !== id));
    } catch {}
  };

  if (!vaga) return null;

  const categoriaTexto = (vaga as any).cargo?.categoria || (vaga as any).categoria || "ADMINISTRATIVO";
  const categoriaCor = categoriaTexto === "OPERACIONAL" ? "orange" : "blue";
  const salarioFmt = vaga.salario != null ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(vaga.salario)) : "-";
  const dataAbertura = new Date(vaga.dataAbertura).toLocaleDateString("pt-BR");
  const dataFim = vaga.dataFinalizacao ? new Date(vaga.dataFinalizacao) : new Date();
  const diasDecorridos = Math.floor((dataFim.getTime() - new Date(vaga.dataAbertura).getTime()) / 86400000);
  const diasRestantes = vaga.slaDias - diasDecorridos;
  const slaTexto = vaga.status === "Concluído" || vaga.status === "Cancelado" ? (vaga.status === "Concluído" ? `Fechado em ${diasDecorridos}d` : "Cancelado") : diasRestantes < 0 ? `Atrasado há ${Math.abs(diasRestantes)} dias` : `Restam ${diasRestantes} dias`;

  return (
    <Modal opened={opened} onClose={onClose} size="xl" centered radius="md" padding="md" title={<Text fw={700} size="sm">{vaga.cargo?.nome || "Cargo"} - {vaga.nivel}</Text>}>
      <Tabs value={tab} onChange={setTab}>
        <Tabs.List>
          <Tabs.Tab value="visao">Visão Geral</Tabs.Tab>
          <Tabs.Tab value="candidatos">Candidatos {candidatos.length > 0 ? `(${candidatos.length})` : ""}</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="visao" pt="md">
          <Stack gap="sm">
            <Group>
              <Badge color={categoriaCor} variant="light" size="sm">{categoriaTexto}</Badge>
              <Badge color="gray" variant="light" size="sm">{vaga.status}</Badge>
              <Badge color={vaga.quantidade > 1 ? "blue" : "gray"} variant="light" size="sm">QTD: {vaga.quantidade}</Badge>
              <Text size="xs" c="dimmed">{slaTexto} · SLA {vaga.slaDias}d · Aberta em {dataAbertura}</Text>
            </Group>
            <Divider />
            <SimpleGrid cols={2} spacing="sm">
              <Paper withBorder p="xs" radius="sm"><Text size="xs" c="dimmed">Gestor</Text><Text size="sm" fw={600}>{vaga.gestor}</Text></Paper>
              <Paper withBorder p="xs" radius="sm"><Text size="xs" c="dimmed">Unidade</Text><Text size="sm" fw={600}>{vaga.unidade}</Text></Paper>
              <Paper withBorder p="xs" radius="sm"><Text size="xs" c="dimmed">Departamento</Text><Text size="sm" fw={600}>{vaga.departamento}</Text></Paper>
              <Paper withBorder p="xs" radius="sm"><Text size="xs" c="dimmed">Recrutador</Text><Text size="sm" fw={600}>{vaga.recrutador}</Text></Paper>
              <Paper withBorder p="xs" radius="sm"><Text size="xs" c="dimmed">Carga Horária</Text><Text size="sm" fw={600}>{vaga.cargaHoraria || "-"}</Text></Paper>
              <Paper withBorder p="xs" radius="sm"><Text size="xs" c="dimmed">Centro de Custo</Text><Text size="sm" fw={600}>{(vaga as any).centroDeCusto || "-"}</Text></Paper>
              <Paper withBorder p="xs" radius="sm"><Text size="xs" c="dimmed">Tipo de Contrato</Text><Text size="sm" fw={600}>{vaga.tipoContrato}</Text></Paper>
              <Paper withBorder p="xs" radius="sm"><Text size="xs" c="dimmed">Motivo</Text><Text size="sm" fw={600}>{vaga.motivo}</Text></Paper>
            </SimpleGrid>
            <Paper withBorder p="xs" radius="sm">
              <Group justify="space-between" align="center">
                <Box><Text size="xs" c="dimmed">Faixa Salarial</Text><Text size="sm" fw={600} style={!showSalario && vaga.salario != null ? { WebkitTextSecurity: "disc" } as any : undefined}>{salarioFmt}</Text></Box>
                <ActionIcon variant="subtle" color="gray" onClick={() => setShowSalario((v) => !v)}>{showSalario ? <IconEyeOff size={16} /> : <IconEye size={16} />}</ActionIcon>
              </Group>
            </Paper>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="candidatos" pt="md">
          <Stack gap="sm">
            <Group justify="space-between">
              <Text size="sm" fw={600}>Candidatos vinculados</Text>
              <Button size="xs" leftSection={<IconPlus size={14} />} onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancelar" : "+ Incluir Candidato"}</Button>
            </Group>

            {showForm && (
              <Paper withBorder p="sm" radius="sm">
                <SimpleGrid cols={2} spacing="sm">
                  <TextInput label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" size="xs" required />
                  <TextInput label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" size="xs" required />
                  <TextInput label="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99999-9999" size="xs" />
                  <Select label="Etapa" data={ETAPAS} value={etapa} onChange={(v) => setEtapa((v as EtapaCandidato) || "Triagem")} size="xs" />
                </SimpleGrid>
                <Group justify="flex-end" mt="sm">
                  <Button size="xs" variant="subtle" color="gray" onClick={() => setShowForm(false)}>Cancelar</Button>
                  <Button size="xs" onClick={handleCreate} loading={saving} disabled={!nome.trim() || !email.trim()}>Salvar</Button>
                </Group>
              </Paper>
            )}

            <ScrollArea>
              <Table withTableBorder withColumnBorders horizontalSpacing="sm" verticalSpacing="xs" fz="xs">
                <Table.Thead><Table.Tr><Table.Th>Nome</Table.Th><Table.Th>Email</Table.Th><Table.Th>Telefone</Table.Th><Table.Th>Etapa</Table.Th><Table.Th /></Table.Tr></Table.Thead>
                <Table.Tbody>
                  {loadingCand ? (
                    <Table.Tr><Table.Td colSpan={5}><Text size="xs" c="dimmed" ta="center">Carregando...</Text></Table.Td></Table.Tr>
                  ) : candidatos.length === 0 ? (
                    <Table.Tr><Table.Td colSpan={5}><Text size="xs" c="dimmed" ta="center">Nenhum candidato cadastrado</Text></Table.Td></Table.Tr>
                  ) : (
                    candidatos.map((c) => (
                      <Table.Tr key={c.id}>
                        <Table.Td>{c.nome}</Table.Td>
                        <Table.Td>{c.email}</Table.Td>
                        <Table.Td>{c.telefone || "-"}</Table.Td>
                        <Table.Td>
                          <Select value={c.etapa} onChange={(v) => v && handleEtapaChange(c, v)} data={ETAPAS} size="xs" w={160} variant="filled"
                            styles={{ input: { fontSize: 12 } }}
                          />
                        </Table.Td>
                        <Table.Td>
                          <Group gap={4} wrap="nowrap" justify="flex-end">
                            <Badge color={etapaColor[c.etapa] || "gray"} size="xs" variant="light">{c.etapa}</Badge>
                            <ActionIcon variant="subtle" color="red" size="xs" onClick={() => handleDelete(c.id)}><IconTrash size={14} /></ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}
