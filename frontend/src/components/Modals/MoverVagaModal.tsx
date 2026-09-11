import { ActionIcon, Button, Group, Modal, Paper, Radio, Stack, Text, TextInput } from "@mantine/core";
import { IconBulb } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import type { StatusVaga, Vaga } from "../../types/vaga";

interface Props {
  vaga: Vaga | null;
  novoStatus: StatusVaga | null;
  onClose: () => void;
  onMoverTodas: () => Promise<void>;
  onMoverParcial: (qtd: number) => Promise<void>;
}

export function MoverVagaModal({ vaga, novoStatus, onClose, onMoverTodas, onMoverParcial }: Props) {
  const [modo, setModo] = useState<"todas" | "parcial">("todas");
  const [qtd, setQtd] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vaga) {
      setModo("todas");
      setQtd(1);
      setLoading(false);
    }
  }, [vaga?.id]);

  if (!vaga || !novoStatus) return null;

  const total = vaga.quantidade;
  const max = Math.max(1, total - 1);
  const resto = total - qtd;
  const origem = vaga.status;
  const clamp = (v: number) => Math.min(Math.max(v, 1), max);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      if (modo === "todas") await onMoverTodas();
      else await onMoverParcial(clamp(qtd));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened
      onClose={onClose}
      centered
      size={580}
      radius="xl"
      padding="xl"
      withCloseButton
      overlayProps={{ backgroundOpacity: 0.45, blur: 4 }}
      styles={{ content: { boxShadow: "var(--mantine-shadow-xl)" } }}
      title={
        <Stack gap={2}>
          <Text fw={700} size="lg">Mover Vaga: {vaga.cargo.nome}</Text>
          <Text size="xs" c="dimmed">
            Confirmar movimentação para <Text span fw={700} c="dark">{novoStatus}</Text>
          </Text>
        </Stack>
      }
    >
      <Stack gap="md">
        <Radio.Group value={modo} onChange={(v) => setModo(v as any)}>
          <Stack gap="md">
            <Paper
              withBorder
              radius="xl"
              p="lg"
              shadow="sm"
              onClick={() => setModo("todas")}
              style={{ cursor: "pointer", borderColor: modo === "todas" ? "var(--mantine-color-blue-5)" : "var(--mantine-color-gray-3)", background: modo === "todas" ? "var(--mantine-color-blue-0)" : "white" }}
            >
              <Group justify="space-between" wrap="nowrap" align="flex-start">
                <Stack gap={4} style={{ flex: 1 }}>
                  <Text fw={600} size="sm">Mover todas as {total} vagas</Text>
                  <Text size="xs" c="dimmed">
                    Transfere o card completo para a coluna <Text span fw={600} c="dark">{novoStatus}</Text>.
                  </Text>
                </Stack>
                <Radio value="todas" size="sm" />
              </Group>
            </Paper>

            <Paper
              withBorder
              radius="xl"
              p="lg"
              shadow="sm"
              onClick={() => setModo("parcial")}
              style={{ cursor: "pointer", borderColor: modo === "parcial" ? "var(--mantine-color-blue-5)" : "var(--mantine-color-gray-3)", background: modo === "parcial" ? "var(--mantine-color-blue-0)" : "white" }}
            >
              <Group justify="space-between" wrap="nowrap" align="flex-start">
                <Stack gap={4} style={{ flex: 1 }}>
                  <Text fw={600} size="sm">Mover apenas parte das vagas</Text>
                  <Text size="xs" c="dimmed">Divide a requisição mantendo o restante na coluna atual.</Text>
                </Stack>
                <Radio value="parcial" size="sm" />
              </Group>
            </Paper>
          </Stack>
        </Radio.Group>

        {modo === "parcial" && (
          <Stack gap="xs" align="center" mt="xs">
            <Group justify="center" gap="xs">
              <ActionIcon variant="light" color="gray" radius="xl" size="lg" onClick={() => setQtd((v) => clamp(v - 1))} disabled={qtd <= 1}>−</ActionIcon>
              <TextInput
                w={72}
                size="md"
                type="number"
                value={String(qtd)}
                onChange={(e) => {
                  const raw = e.currentTarget.value;
                  if (raw === "") return;
                  const n = Number(raw);
                  if (Number.isNaN(n)) return;
                  setQtd(clamp(Math.trunc(n)));
                }}
                onBlur={() => setQtd((v) => clamp(v))}
                min={1}
                max={max}
                styles={{ input: { textAlign: "center", borderRadius: 999 } }}
              />
              <ActionIcon variant="light" color="gray" radius="xl" size="lg" onClick={() => setQtd((v) => clamp(v + 1))} disabled={qtd >= max}>+</ActionIcon>
            </Group>
            <Group gap={4} justify="center" wrap="nowrap">
              <IconBulb size={14} style={{ flexShrink: 0 }} />
              <Text size="xs" c="dimmed">
                <Text span fw={700} c="dark">{qtd}</Text> {qtd === 1 ? "vaga vai" : "vagas vão"} para <Text span fw={700} c="dark">{novoStatus}</Text> e <Text span fw={700} c="dark">{resto}</Text> {resto === 1 ? "vaga permanece" : "vagas permanecem"} em <Text span fw={700} c="dark">{origem}</Text>.
              </Text>
            </Group>
          </Stack>
        )}

        <Group justify="flex-end" gap="sm" mt="lg">
          <Button variant="subtle" color="gray" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button onClick={handleConfirm} loading={loading} radius="md" disabled={modo === "parcial" && (qtd < 1 || qtd > max)}>
            {modo === "todas" ? `Mover ${total} ${total === 1 ? "Vaga" : "Vagas"}` : `Mover ${qtd} ${qtd === 1 ? "Vaga" : "Vagas"}`}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
