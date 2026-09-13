import { Button, Group, Modal, NumberInput, Paper, Radio, Stack, Text } from "@mantine/core";
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
      size={520}
      radius="md"
      padding="lg"
      withCloseButton
      title={
        <Stack gap={2}>
          <Text fw={600} size="sm">Mover Vaga: {vaga.cargo.nome}</Text>
          <Text size="xs" c="dimmed">Destino: {novoStatus}</Text>
        </Stack>
      }
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">Como você deseja mover este processo?</Text>
        <Radio.Group value={modo} onChange={(v) => setModo(v as any)}>
          <Stack gap="sm">
            <Paper
              withBorder
              radius="md"
              p="md"
              onClick={() => setModo("todas")}
              style={{ cursor: "pointer", borderColor: modo === "todas" ? "var(--mantine-color-blue-5)" : "var(--mantine-color-gray-3)" }}
            >
              <Group justify="space-between" wrap="nowrap" align="center">
                <Text fw={600} size="sm">Mover todas as {total} vagas</Text>
                <Radio value="todas" />
              </Group>
            </Paper>
            <Paper
              withBorder
              radius="md"
              p="md"
              onClick={() => setModo("parcial")}
              style={{ cursor: "pointer", borderColor: modo === "parcial" ? "var(--mantine-color-blue-5)" : "var(--mantine-color-gray-3)" }}
            >
              <Group justify="space-between" wrap="nowrap" align="center">
                <Text fw={600} size="sm">{modo === "parcial" ? `Mover apenas ${qtd} ${qtd === 1 ? "vaga" : "vagas"}` : "Mover apenas parte das vagas"}</Text>
                <Radio value="parcial" />
              </Group>
              {modo === "parcial" && (
                <Group gap="sm" mt="sm" wrap="nowrap" onClick={(e) => e.stopPropagation()}>
                  <NumberInput value={qtd} onChange={(v) => setQtd(clamp(Number(v) || 1))} min={1} max={max} w={100} size="sm" allowDecimal={false} />
                  <Text size="xs" c="dimmed">
                    {qtd} vai para {novoStatus} ({resto} fica em {origem})
                  </Text>
                </Group>
              )}
            </Paper>
          </Stack>
        </Radio.Group>
        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" color="gray" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button color="blue" onClick={handleConfirm} loading={loading} disabled={modo === "parcial" && (qtd < 1 || qtd > max)}>Confirmar</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
