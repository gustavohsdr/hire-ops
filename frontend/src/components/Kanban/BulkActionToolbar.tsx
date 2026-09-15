import { Badge, Button, Group, Menu, Paper, Text, Transition } from "@mantine/core";
import { IconChevronUp } from "@tabler/icons-react";
import type { SubEtapaVaga } from "../../types/vaga";

const BULK_OPCOES: { value: SubEtapaVaga; label: string }[] = [
  { value: "ALINHAMENTO", label: "02. Alinhamento da Vaga" },
  { value: "DIVULGACAO", label: "03. Divulgação da Vaga" },
  { value: "TRIAGEM", label: "04. Triagem de Currículos" },
  { value: "VALIDACAO", label: "05. Validação dos Candidatos" },
  { value: "AGENDAMENTO", label: "06. Agendamento das Entrevistas" },
  { value: "ENTREVISTA", label: "07. Entrevista" },
  { value: "ADMISSAO", label: "08. Processo de Admissão" },
];

interface Props {
  count: number;
  onClear: () => void;
  onAlterar: (subEtapa: SubEtapaVaga) => void;
  loading?: boolean;
}

export function BulkActionToolbar({ count, onClear, onAlterar, loading }: Props) {
  return (
    <Transition mounted={count > 0} transition="slide-up" duration={200} timingFunction="ease">
      {(styles) => (
        <Paper
          withBorder
          shadow="xl"
          radius="xl"
          p="xs"
          px="md"
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: `${styles.transform || ""} translateX(-50%)`.trim(),
            zIndex: 1000,
            minWidth: 360,
            maxWidth: "calc(100% - 24px)",
            opacity: styles.opacity,
            transitionProperty: styles.transitionProperty as any,
            transitionDuration: styles.transitionDuration as any,
            transitionTimingFunction: styles.transitionTimingFunction as any,
          }}
        >
          <Group justify="space-between" wrap="nowrap">
            <Group gap="xs">
              <Badge color="blue" variant="filled" size="sm">{count} selecionados</Badge>
              <Text size="xs" c="dimmed">ações em lote</Text>
            </Group>
            <Group gap="xs" wrap="nowrap">
              <Menu position="top-start" offset={8} withinPortal width={220} shadow="md">
                <Menu.Target>
                  <Button size="xs" variant="light" color="blue" loading={loading} rightSection={<IconChevronUp size={12} />}>Alterar Sub-etapa</Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Pipeline 02 — 08</Menu.Label>
                  {BULK_OPCOES.map((s) => (
                    <Menu.Item key={s.value} onClick={() => onAlterar(s.value)}>{s.label}</Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
              <Button size="xs" variant="subtle" color="gray" onClick={onClear}>Limpar</Button>
            </Group>
          </Group>
        </Paper>
      )}
    </Transition>
  );
}
