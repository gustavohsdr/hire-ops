import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import type { Vaga } from "../../types/vaga";

interface Props {
  vagaParaExcluir: Vaga | null;
  setVagaParaExcluir: (v: Vaga | null) => void;
  confirmarExclusao: () => void;
}

export function ConfirmarExclusaoModal({ vagaParaExcluir, setVagaParaExcluir, confirmarExclusao }: Props) {
  return (
    <Modal
      opened={!!vagaParaExcluir}
      onClose={() => setVagaParaExcluir(null)}
      title={<Text fw={700}>Confirmar exclusão</Text>}
      centered
      radius="md"
      size="sm"
    >
      <Stack gap="md">
        <Text size="sm">
          Tem certeza que deseja excluir a vaga de <b>{vagaParaExcluir?.cargo.nome}</b>? Esta ação não pode ser desfeita.
        </Text>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setVagaParaExcluir(null)}>
            Cancelar
          </Button>
          <Button color="red" onClick={confirmarExclusao}>
            Confirmar
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
