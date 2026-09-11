import { Paper, SimpleGrid, Text } from "@mantine/core";
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
      <Paper withBorder p="md" radius="md" bg="white">
        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Processos Ativos</Text>
        <Text fw={800} size="xl">{processosAtivos}</Text>
      </Paper>
      <Paper withBorder p="md" radius="md" bg="white">
        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Dentro do SLA</Text>
        <Text fw={800} size="xl">{pctSla}%</Text>
        <Text size="xs" c="dimmed">{dentroSlaQtd}/{processosAtivos} posições no prazo</Text>
      </Paper>
      <Paper withBorder p="md" radius="md" bg="white">
        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Fechadas no Mês</Text>
        <Text fw={800} size="xl">{fechadasMes}</Text>
      </Paper>
    </SimpleGrid>
  );
}
