import { Group, Paper, SimpleGrid, Text } from "@mantine/core";
import type { Vaga } from "../types/vaga";

function diasRestantes(v: Vaga) {
  const fim = v.dataFinalizacao ? new Date(v.dataFinalizacao) : new Date();
  const dias = Math.floor((fim.getTime() - new Date(v.dataAbertura).getTime()) / (1000 * 3600 * 24));
  return v.slaDias - dias;
}

export function MetricasBar({ vagas }: { vagas: Vaga[] }) {
  const ativas = vagas.filter((v) => v.status !== "Concluído" && v.status !== "Cancelado");
  const processosAtivos = ativas.reduce((a, v) => a + v.quantidade, 0);
  const dentroSlaQtd = ativas.filter((v) => diasRestantes(v) >= 0).reduce((a, v) => a + v.quantidade, 0);
  const pctSla = processosAtivos ? Math.round((dentroSlaQtd / processosAtivos) * 100) : 0;
  const fechadasMes = vagas
    .filter((v) => {
      if (v.status !== "Concluído" || !v.dataFinalizacao) return false;
      const d = new Date(v.dataFinalizacao);
      const n = new Date();
      return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
    })
    .reduce((a, v) => a + v.quantidade, 0);

  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
      <Paper withBorder p="md" radius="md" bg="white" style={{ minHeight: 88 }}>
        <Group justify="space-between" h={20} mb="xs">
          <Text size="xs" c="dimmed" fw={700}>PROCESSOS ATIVOS</Text>
        </Group>
        <Text size="xl" fw={700} lh={1}>{processosAtivos}</Text>
      </Paper>
      <Paper withBorder p="md" radius="md" bg="white" style={{ minHeight: 88 }}>
        <Group justify="space-between" h={20} mb="xs">
          <Text size="xs" c="dimmed" fw={700}>DENTRO DO SLA</Text>
          <Text size="xs" c="dimmed">{dentroSlaQtd}/{processosAtivos} no prazo</Text>
        </Group>
        <Text size="xl" fw={700} lh={1}>{pctSla}%</Text>
      </Paper>
      <Paper withBorder p="md" radius="md" bg="white" style={{ minHeight: 88 }}>
        <Group justify="space-between" h={20} mb="xs">
          <Text size="xs" c="dimmed" fw={700}>FECHADAS NO MÊS</Text>
        </Group>
        <Text size="xl" fw={700} lh={1}>{fechadasMes}</Text>
      </Paper>
    </SimpleGrid>
  );
}
