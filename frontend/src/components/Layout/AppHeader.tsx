import { Avatar, Burger, Button, Divider, Group, Menu, Select, Text, TextInput } from "@mantine/core";
import { IconBell, IconCheck, IconPlus, IconSearch, IconX } from "@tabler/icons-react";
import { useState } from "react";
import type { SubEtapaVaga, Vaga } from "../../types/vaga";
import { formatarDataLocal } from "../../utils/formatters";
import { api } from "../../services/api";

interface Props {
  busca: string;
  onBuscaChange: (v: string) => void;
  onNovaVaga: () => void;
  opened: boolean;
  onToggle: () => void;
  vagasPendentes?: Vaga[];
  onDecisao?: (vaga: Vaga) => void;
  onAprovar?: (vaga: Vaga) => void;
  onVagaAtualizada?: (vaga: Vaga) => void;
}

const RETORNO_OPTS = [
  { value: "ALINHAMENTO", label: "02. ALINHAMENTO DA VAGA" },
  { value: "TRIAGEM", label: "04. TRIAGEM DE CURRÍCULOS" },
  { value: "ENTREVISTA", label: "07. ENTREVISTA" },
] as const;

export function AppHeader({ busca, onBuscaChange, onNovaVaga, opened, onToggle, vagasPendentes = [], onDecisao, onAprovar, onVagaAtualizada }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [motivo, setMotivo] = useState("");
  const [retorno, setRetorno] = useState<string>("ENTREVISTA");
  const [saving, setSaving] = useState(false);

  const handleAprovar = async (v: Vaga) => {
    if (onAprovar) { onAprovar(v); return; }
    try {
      const atualizado = await api.decisaoAdmissao(v.id, { resultado: "APROVADO" });
      onVagaAtualizada?.(atualizado);
    } catch {}
  };

  const toggleReprovar = (v: Vaga) => {
    if (expandedId === v.id) {
      setExpandedId(null);
      setMotivo("");
      setRetorno("ENTREVISTA");
    } else {
      setExpandedId(v.id);
      setMotivo("");
      setRetorno("ENTREVISTA");
    }
  };

  const handleConfirmarReprovar = async (v: Vaga) => {
    if (!motivo.trim() || saving) return;
    setSaving(true);
    try {
      const atualizado = await api.decisaoAdmissao(v.id, { resultado: "REPROVADO", motivo: motivo.trim(), subEtapaRetorno: retorno as SubEtapaVaga });
      onVagaAtualizada?.(atualizado);
      if (!onVagaAtualizada && onDecisao) onDecisao(atualizado as any);
      setExpandedId(null);
      setMotivo("");
      setRetorno("ENTREVISTA");
    } catch {}
    finally { setSaving(false); }
  };

  return (
    <Group h="100%" px="md" justify="space-between" wrap="nowrap">
      <Group gap="sm">
        <Burger opened={opened} onClick={onToggle} hiddenFrom="sm" size="sm" />
        <Text fw={800} size="lg">RH App</Text>
      </Group>
      <TextInput placeholder="Buscar vaga..." leftSection={<IconSearch size={16} />} value={busca} onChange={(e) => onBuscaChange(e.currentTarget.value)} maw={360} style={{ flex: 1 }} visibleFrom="sm" />
      <Group gap="sm" wrap="nowrap">
        {vagasPendentes.length > 0 && (
          <Menu position="bottom-end" width={360} withinPortal shadow="md" closeOnItemClick={false}>
            <Menu.Target>
              <Button variant="subtle" size="xs" leftSection={<IconBell size={18} />}>({vagasPendentes.length}) Pendentes</Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Admissões pendentes</Menu.Label>
              {vagasPendentes.map((v) => {
                const isExpanded = expandedId === v.id;
                return (
                  <div key={v.id} style={{ padding: "6px 12px" }}>
                    <Text size="xs" fw={600} truncate>{v.cargo?.nome || "Cargo"} - {v.nivel}</Text>
                    <Text size="xs" c="dimmed" truncate>{(v as any).candidatoNome || ""} · {formatarDataLocal((v as any).dataAdmissao)}</Text>
                    {!isExpanded ? (
                      <Group gap={6} mt={6} wrap="nowrap">
                        <Button size="xs" color="green" variant="light" leftSection={<IconCheck size={14} />} onClick={(e) => { e.stopPropagation(); handleAprovar(v); }}>Aprovar</Button>
                        <Button size="xs" color="red" variant="light" leftSection={<IconX size={14} />} onClick={(e) => { e.stopPropagation(); toggleReprovar(v); }}>Reprovar / Desistir</Button>
                      </Group>
                    ) : (
                      <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--mantine-color-gray-2)" }}>
                        <TextInput label="Motivo" placeholder="Informe o motivo" size="xs" required value={motivo} onChange={(e) => setMotivo(e.currentTarget.value)} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} mb="xs" />
                        <Select label="Retornar para etapa" data={RETORNO_OPTS as any} value={retorno} onChange={(v) => setRetorno(v || "ENTREVISTA")} size="xs" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} mb="xs" />
                        <Group gap={6} justify="flex-end" mt="xs">
                          <Button size="xs" variant="subtle" color="gray" onClick={(e) => { e.stopPropagation(); setExpandedId(null); setMotivo(""); }}>Cancelar</Button>
                          <Button size="xs" color="red" variant="light" onClick={(e) => { e.stopPropagation(); handleConfirmarReprovar(v); }} loading={saving} disabled={!motivo.trim()}>Confirmar Retorno da Vaga</Button>
                        </Group>
                      </div>
                    )}
                    <Divider mt={8} />
                  </div>
                );
              })}
            </Menu.Dropdown>
          </Menu>
        )}
        <Button leftSection={<IconPlus size={16} />} onClick={onNovaVaga} radius="md" size="sm">Nova Vaga</Button>
        <Avatar radius="xl" color="blue" size="sm">RH</Avatar>
      </Group>
    </Group>
  );
}
