import { Paper, Text } from "@mantine/core";
import type { Vaga } from "../types/vaga";

export function MetricasBar({ vagas }: { vagas: Vaga[] }) {
  const totalProcessos = vagas.length;
  const totalVagas = vagas.reduce((acc, v) => acc + v.quantidade, 0);

  return (
    <Paper withBorder p="md" radius="md" bg="white">
      <Text fw={700} size="sm">
        {totalProcessos} Processos Ativos{totalVagas > totalProcessos ? ` (${totalVagas} vagas no total)` : ""}
      </Text>
    </Paper>
  );
}
