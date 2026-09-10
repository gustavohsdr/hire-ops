import { Button, Group, Modal, NumberInput, SegmentedControl, Stack, Text } from "@mantine/core";
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
  const [qtd, setQtd] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vaga) {
      setModo("todas");
      setQtd(1);
      setLoading(false);
    }
  }, [vaga?.id]);

  if (!vaga || !novoStatus) return null;

  const max = vaga.quantidade - 1;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      if (modo === "todas") await onMoverTodas();
      else await onMoverParcial(qtd);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened onClose={onClose} title={<Text fw={700}>Mover vaga</Text>} centered radius="md" size="sm">
      <Stack gap="md">
        <Text size="sm">
          Deseja mover todas as <b>{vaga.quantidade} vagas</b> de <b>{vaga.cargo.nome}</b> para <b>{novoStatus}</b> ou apenas algumas?
        </Text>
        <SegmentedControl fullWidth value={modo} onChange={(v) => setModo(v as any)} data={[{ label: "Todas", value: "todas" }, { label: "Parcial", value: "parcial" }]} />
        {modo === "parcial" && (
          <NumberInput
            label={`Quantas mover? (1 a ${max})`}
            value={qtd}
            onChange={(v) => setQtd(Number(v) || 1)}
            min={1}
            max={max}
            clampBehavior="strict"
          />
        )}
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} loading={loading} disabled={modo === "parcial" && (qtd < 1 || qtd > max)}>
            {modo === "todas" ? `Mover todas (${vaga.quantidade})` : `Mover ${qtd} vaga(s)`}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
