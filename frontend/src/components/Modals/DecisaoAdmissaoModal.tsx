import { Button, Group, Modal, Radio, Select, Stack, Text, Textarea } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import type { SubEtapaVaga, Vaga } from "../../types/vaga";

interface Props {
  vaga: Vaga | null;
  opened: boolean;
  onClose: () => void;
  onConfirm: (data: { resultado: "APROVADO" | "REPROVADO" | "DESISTENCIA"; motivo?: string | null; subEtapaRetorno?: SubEtapaVaga }) => Promise<void>;
}

const RETORNO_OPTS = [
  { value: "TRIAGEM", label: "TRIAGEM DE CURRÍCULOS" },
  { value: "VALIDACAO", label: "VALIDAÇÃO DOS CANDIDATOS" },
  { value: "AGENDAMENTO", label: "AGENDAMENTO DAS ENTREVISTAS" },
  { value: "ENTREVISTA", label: "ENTREVISTA" },
  { value: "ALINHAMENTO", label: "ALINHAMENTO DA VAGA" },
  { value: "DIVULGACAO", label: "DIVULGAÇÃO DA VAGA" },
];

export function DecisaoAdmissaoModal({ vaga, opened, onClose, onConfirm }: Props) {
  const [resultado, setResultado] = useState<"APROVADO" | "REPROVADO" | "DESISTENCIA">("APROVADO");
  const [motivo, setMotivo] = useState("");
  const [retorno, setRetorno] = useState<string>("TRIAGEM");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (opened) {
      setResultado("APROVADO");
      setMotivo("");
      setRetorno("TRIAGEM");
    }
  }, [opened, vaga?.id]);

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onConfirm({ resultado, motivo: motivo.trim() || null, subEtapaRetorno: resultado !== "APROVADO" ? (retorno as SubEtapaVaga) : undefined });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={<Text fw={700} size="sm">Decisão de Admissão</Text>} centered radius="md" padding="md">
      <Stack gap="sm">
        <Text size="xs" c="dimmed">{vaga ? `${vaga.cargo?.nome || "Cargo"} - ${vaga.nivel} · ${(vaga as any).candidatoNome || ""}` : ""}</Text>
        <Radio.Group value={resultado} onChange={(v) => setResultado(v as any)} label="Resultado">
          <Group mt="xs">
            <Radio value="APROVADO" label="Aprovar" />
            <Radio value="REPROVADO" label="Reprovar" />
            <Radio value="DESISTENCIA" label="Desistência" />
          </Group>
        </Radio.Group>
        {resultado !== "APROVADO" && (
          <>
            <Select label="Retornar para etapa" data={RETORNO_OPTS} value={retorno} onChange={(v) => setRetorno(v || "TRIAGEM")} size="sm" />
            <Textarea label="Motivo" placeholder="Informe o motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} minRows={3} size="sm" />
          </>
        )}
        <Group justify="flex-end" mt="xs">
          <Button variant="subtle" color="gray" onClick={onClose} disabled={loading}>Cancelar</Button>
          {resultado === "APROVADO" ? (
            <Button color="teal" leftSection={<IconCheck size={16} />} onClick={handleSubmit} loading={loading}>Aprovar e Concluir</Button>
          ) : (
            <Button color="red" leftSection={<IconX size={16} />} onClick={handleSubmit} loading={loading}>Confirmar Reprovação</Button>
          )}
        </Group>
      </Stack>
    </Modal>
  );
}
