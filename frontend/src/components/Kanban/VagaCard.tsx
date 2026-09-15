import { Draggable } from "@hello-pangea/dnd";
import { ActionIcon, Badge, Box, Button, Card, Divider, Group, Menu, Paper, Popover, Radio, Select, Stack, Text, TextInput, Textarea, Tooltip, UnstyledButton } from "@mantine/core";
import { IconAlertTriangle, IconCheck, IconChevronDown, IconChevronRight, IconCopy, IconDotsVertical, IconMapPin, IconPencil, IconTrash, IconUser, IconUserCheck } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import type { StatusVaga, SubEtapaVaga, Vaga } from "../../types/vaga";

interface VagaCardProps {
  vaga: Vaga;
  index: number;
  onEditar: (vaga: Vaga) => void;
  onDuplicar: (vaga: Vaga) => void;
  onExcluir: (vaga: Vaga) => void;
  onMudarStatus: (id: number, novoStatus: StatusVaga) => void;
  onDetalhes?: (vaga: Vaga) => void;
  onSubEtapa?: (id: number, subEtapa: SubEtapaVaga) => void;
  onDecisaoAdmissao?: (vaga: Vaga) => void;
  onVagaAtualizada?: (vaga: Vaga) => void;
  selected?: boolean;
  onToggleSelect?: (id: number) => void;
  isPending?: boolean;
  isBulkActive?: boolean;
}

const STATUS_OPCOES: StatusVaga[] = ["Em Aberto", "Em Andamento", "Congelado", "Concluído", "Cancelado"];
export const SUB_ETAPAS: { value: SubEtapaVaga; label: string }[] = [
  { value: "ALINHAMENTO", label: "🤝 02. Alinhamento da Vaga" },
  { value: "DIVULGACAO", label: "📢 03. Divulgação da Vaga" },
  { value: "TRIAGEM", label: "🔍 04. Triagem de Currículos" },
  { value: "VALIDACAO", label: "🎯 05. Validação dos Candidatos" },
  { value: "AGENDAMENTO", label: "📅 06. Agendamento das Entrevistas" },
  { value: "ENTREVISTA", label: "🗣️ 07. Entrevista" },
  { value: "ADMISSAO", label: "📝 08. Processo de Admissão" },
];

const formatarSubEtapa = (subEtapa?: string) => {
  if (!subEtapa) return "ALINHAMENTO DA VAGA";
  return subEtapa
    .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, "")
    .replace(/^\d+\.\s*/, "")
    .trim()
    .toUpperCase();
};

export const VagaCard: React.FC<VagaCardProps> = ({ vaga, index, onEditar, onDuplicar, onExcluir, onMudarStatus, onDetalhes, onSubEtapa, onDecisaoAdmissao, onVagaAtualizada, selected, onToggleSelect, isPending, isBulkActive }) => {
  const [hovered, setHovered] = useState(false);
  const [adMenuOpened, setAdMenuOpened] = useState(false);
  const [showAdmissaoCard, setShowAdmissaoCard] = useState(false);
  const [candidatoNome, setCandidatoNome] = useState<string>((vaga as any).candidatoNome || "");
  const [dataAdmissao, setDataAdmissao] = useState<string>((vaga as any).dataAdmissao ? String((vaga as any).dataAdmissao).slice(0, 10) : "");
  const [savingAdmissao, setSavingAdmissao] = useState(false);
  const isSelected = !!selected;
  const RETORNO_OPTS = [
    { value: "ALINHAMENTO", label: "02. Alinhamento da Vaga" },
    { value: "DIVULGACAO", label: "03. Divulgação da Vaga" },
    { value: "TRIAGEM", label: "04. Triagem de Currículos" },
    { value: "VALIDACAO", label: "05. Validação dos Candidatos" },
    { value: "AGENDAMENTO", label: "06. Agendamento das Entrevistas" },
    { value: "ENTREVISTA", label: "07. Entrevista" },
  ] as const;
  const [resultado, setResultado] = useState<"APROVADO" | "REPROVADO" | "DESISTENCIA">("APROVADO");
  const [motivo, setMotivo] = useState("");
  const [retorno, setRetorno] = useState<string>("ENTREVISTA");
  const dataVencida = !!dataAdmissao && dataAdmissao.slice(0, 10) <= new Date().toISOString().slice(0, 10);
  const [globalMod, setGlobalMod] = useState(false);
  useEffect(() => {
    const upd = (e: KeyboardEvent) => setGlobalMod(e.shiftKey || e.ctrlKey || e.metaKey);
    const clr = () => setGlobalMod(false);
    window.addEventListener("keydown", upd);
    window.addEventListener("keyup", clr);
    window.addEventListener("blur", clr);
    return () => { window.removeEventListener("keydown", upd); window.removeEventListener("keyup", clr); window.removeEventListener("blur", clr); };
  }, []);
  const isSubEtapaLocked = !!isBulkActive || globalMod;
  const categoriaTexto = vaga.cargo?.categoria || (vaga as any).categoria || "ADMINISTRATIVO";
  const categoriaCor = categoriaTexto === "OPERACIONAL" ? "orange" : "blue";
  const dataAbertura = new Date(vaga.dataAbertura);
  const dataFim = vaga.dataFinalizacao ? new Date(vaga.dataFinalizacao) : new Date();
  const diasDecorridos = Math.floor((dataFim.getTime() - dataAbertura.getTime()) / (1000 * 3600 * 24));
  const diasRestantes = vaga.slaDias - diasDecorridos;
  const isFinalizada = vaga.status === "Concluído" || vaga.status === "Cancelado";
  let slaStatus: "VENCIDO" | "ATENCAO" | "OK" | "NEUTRO" = "NEUTRO";
  if (!isFinalizada) {
    if (diasRestantes < 0) slaStatus = "VENCIDO";
    else if (diasRestantes <= 5) slaStatus = "ATENCAO";
    else slaStatus = "OK";
  }
  let badgeColor = "gray";
  let borderLeft = "1px solid var(--mantine-color-gray-3)";
  if (!isFinalizada) {
    if (slaStatus === "VENCIDO") {
      badgeColor = "red";
      borderLeft = "4px solid var(--mantine-color-red-6)";
    } else if (slaStatus === "ATENCAO") {
      badgeColor = "yellow";
      borderLeft = "4px solid var(--mantine-color-yellow-6)";
    }
  }
  const subEtapaVal = (vaga as any).subEtapa as SubEtapaVaga | null | undefined;
  const subEtapaDisplay = formatarSubEtapa(subEtapaVal ? (SUB_ETAPAS.find((s) => s.value === subEtapaVal)?.label || subEtapaVal) : undefined);
  const isAdmissaoPendente = (vaga as any).subEtapa === "ADMISSAO" && (!(vaga as any).statusAdmissao || (vaga as any).statusAdmissao === "PENDENTE") && !!(vaga as any).dataAdmissao && (vaga as any).candidatoNome;
  const admissaoVencida = isAdmissaoPendente && new Date((vaga as any).dataAdmissao) <= new Date(new Date().toISOString().slice(0, 10) + "T23:59:59");
  const textoSlaCompleto = isFinalizada ? (vaga.status === "Concluído" ? `FECHADO EM ${diasDecorridos}D` : "CANCELADO") : slaStatus === "VENCIDO" ? `ATRASADO HÁ ${Math.abs(diasRestantes)} DIAS` : `RESTAM: ${diasRestantes} DIAS`;

  const handleCardClick = (e: React.MouseEvent) => {
    if (showAdmissaoCard) return;
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      e.stopPropagation();
      onToggleSelect?.(vaga.id);
      return;
    }
    onDetalhes?.(vaga);
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect?.(vaga.id);
  };

  useEffect(() => {
    if (showAdmissaoCard) {
      setCandidatoNome((vaga as any).candidatoNome || "");
      setDataAdmissao((vaga as any).dataAdmissao ? String((vaga as any).dataAdmissao).slice(0, 10) : "");
      setResultado("APROVADO");
      setMotivo("");
      setRetorno("ENTREVISTA");
    }
  }, [showAdmissaoCard, vaga]);

  const handleSalvarAdmissaoInline = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!candidatoNome.trim() || savingAdmissao) return;
    setSavingAdmissao(true);
    try {
      if (dataVencida) {
        const precisaSalvar = candidatoNome.trim() !== String((vaga as any).candidatoNome || "").trim() || dataAdmissao !== String((vaga as any).dataAdmissao || "").slice(0, 10);
        if (precisaSalvar) {
          await api.salvarAdmissao(vaga.id, { candidatoNome: candidatoNome.trim(), dataAdmissao: dataAdmissao || null });
          if ((vaga as any).subEtapa !== "ADMISSAO") await api.updateSubEtapa(vaga.id, "ADMISSAO");
        } else if ((vaga as any).subEtapa !== "ADMISSAO") {
          await api.updateSubEtapa(vaga.id, "ADMISSAO");
        }
        const atualizado = await api.decisaoAdmissao(vaga.id, { resultado, motivo: motivo.trim() || null, subEtapaRetorno: resultado !== "APROVADO" ? (retorno as any) : undefined });
        onVagaAtualizada?.(atualizado);
      } else {
        const atualizado = await api.salvarAdmissao(vaga.id, { candidatoNome: candidatoNome.trim(), dataAdmissao: dataAdmissao || null });
        if ((vaga as any).subEtapa !== "ADMISSAO") {
          const comSub = await api.updateSubEtapa(vaga.id, "ADMISSAO");
          onVagaAtualizada?.(comSub);
        } else {
          onVagaAtualizada?.(atualizado);
        }
      }
      setShowAdmissaoCard(false);
      setAdMenuOpened(false);
    } catch {}
    finally { setSavingAdmissao(false); }
  };

  return (
    <Draggable draggableId={String(vaga.id)} index={index} isDragDisabled={!!isPending}>
      {(provided, snapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{ position: "relative" as const, ...(provided.draggableProps.style as any), ...(snapshot.isDragging ? { zIndex: 5000 } : {}) }}
        >
          <Popover opened={showAdmissaoCard} onChange={setShowAdmissaoCard} position="right-start" offset={8} withinPortal shadow="md" withArrow={false} trapFocus={false} closeOnClickOutside={false} closeOnEscape>
            <Popover.Target>
              <Card
                {...provided.dragHandleProps}
                shadow={snapshot.isDragging ? "xl" : "xs"}
                padding={0}
                radius="md"
                withBorder={!selected}
                bg="white"
                opacity={isPending ? 0.6 : snapshot.isDragging ? 0.95 : 1}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                styles={{
                  root: {
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    MozUserSelect: "none",
                    msUserSelect: "none",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
                    borderColor: isSelected ? "#228be6" : undefined,
                    boxShadow: isSelected ? "0 0 0 2px rgba(34, 139, 230, 0.25)" : undefined,
                    "&:hover": !isSelected ? { borderColor: "#a5d8ff", boxShadow: "0 0 0 3px rgba(34, 139, 230, 0.12)" } : undefined,
                  } as any,
                }}
                style={{
                  ...(isPending ? { borderStyle: "dashed" as const } : {}),
                  borderLeft: isSelected ? "2px solid #228be6" : borderLeft,
                  border: isSelected ? "2px solid #228be6" : undefined,
                  borderRight: isSelected ? "2px solid #228be6" : undefined,
                  borderTop: isSelected ? "2px solid #228be6" : undefined,
                  borderBottom: isSelected ? "2px solid #228be6" : undefined,
                  overflow: "hidden",
                  userSelect: "none",
                  WebkitUserSelect: "none" as any,
                  MozUserSelect: "none" as any,
                  msUserSelect: "none" as any,
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
                  ...(isSelected
                    ? { borderColor: "#228be6", boxShadow: "0 0 0 2px rgba(34, 139, 230, 0.25)" }
                    : hovered
                      ? { borderColor: "#a5d8ff", boxShadow: "0 0 0 3px rgba(34, 139, 230, 0.12)" }
                      : {}),
                }}
              >
                <Group wrap="nowrap" align="stretch" gap={0} style={{ overflow: "hidden", position: "relative" }}>
                  <Box
                    onClick={handleCheckboxClick}
                    style={{
                      width: selected || hovered ? 24 : 0,
                      minWidth: selected || hovered ? 24 : 0,
                      opacity: selected || hovered ? 1 : 0,
                      transform: selected || hovered ? "translateX(0)" : "translateX(-10px)",
                      marginRight: selected || hovered ? 6 : 0,
                      overflow: "hidden",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "center",
                      paddingTop: 8,
                      cursor: "pointer",
                      flexShrink: 0,
                      background: selected ? "var(--mantine-color-blue-0)" : "transparent",
                    }}
                  >
                    <Box
                      w={20}
                      h={20}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: `2px solid ${selected ? "#228be6" : "var(--mantine-color-gray-4)"}`,
                        background: selected ? "#228be6" : "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.2s ease",
                        transform: selected ? "scale(1)" : "scale(0.92)",
                      }}
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); onToggleSelect?.(vaga.id); }}
                    >
                      <IconCheck size={12} color="white" style={{ opacity: selected ? 1 : 0, transform: selected ? "scale(1)" : "scale(0.4)", transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)" }} />
                    </Box>
                  </Box>
                  <Box flex={1} style={{ flex: 1, minWidth: 0, padding: 8, cursor: onDetalhes ? "pointer" : undefined }} onClick={handleCardClick}>
                    <Group align="center" justify="space-between" mb="xs" wrap="nowrap">
                      <Tooltip label={categoriaTexto} position="top" radius="sm" withArrow={false}>
                        <Badge color={categoriaCor} size="xs" variant="light" style={{ textTransform: "uppercase", letterSpacing: 0.4 }}>
                          {categoriaTexto}
                        </Badge>
                      </Tooltip>
                      <Group gap={6} wrap="nowrap">
                        <Tooltip label={textoSlaCompleto} color="dark" fz={11} px={8} py={4} radius="sm" withArrow={false} transitionProps={{ transition: "fade", duration: 150 }} position="top" disabled={textoSlaCompleto.length < 18}>
                          <Badge size="xs" color={badgeColor} variant="filled" leftSection={slaStatus === "VENCIDO" ? <IconAlertTriangle size={10} /> : undefined}>
                            {textoSlaCompleto}
                          </Badge>
                        </Tooltip>
                        <Menu shadow="md" width={170} position="bottom-end">
                          <Menu.Target>
                            <ActionIcon variant="subtle" color="gray" size="xs" onClick={(e) => e.stopPropagation()}>
                              <IconDotsVertical size={14} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Label>Ações</Menu.Label>
                            <Menu.Item leftSection={<IconPencil size={14} />} onClick={(e) => { (e as any).stopPropagation?.(); onEditar(vaga); }}>Editar</Menu.Item>
                            <Menu.Item leftSection={<IconCopy size={14} />} onClick={(e) => { (e as any).stopPropagation?.(); onDuplicar(vaga); }}>Duplicar</Menu.Item>
                            <Menu.Sub>
                              <Menu.Sub.Target>
                                <Menu.Sub.Item rightSection={<IconChevronRight size={14} />}>Mover Status</Menu.Sub.Item>
                              </Menu.Sub.Target>
                              <Menu.Sub.Dropdown>
                                {STATUS_OPCOES.map((st) => (
                                  <Menu.Item key={st} disabled={vaga.status === st} onClick={(e) => { (e as any).stopPropagation?.(); onMudarStatus(vaga.id, st); }}>
                                    {st}
                                  </Menu.Item>
                                ))}
                              </Menu.Sub.Dropdown>
                            </Menu.Sub>
                            <Menu.Divider />
                            <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={(e) => { (e as any).stopPropagation?.(); onExcluir(vaga); }}>Excluir</Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    </Group>
                    <Tooltip label={`${vaga.cargo?.nome || "Cargo"} - ${vaga.nivel}`} color="dark" fz={11} px={8} py={4} radius="sm" withArrow={false} transitionProps={{ transition: "fade", duration: 150 }} position="top" disabled={(vaga.cargo?.nome?.length ?? 0) < 32}>
                      <Text fw={600} fz={12} lh={1.3} display="block" truncate="end" style={{ margin: 0, padding: 0 }}>
                        {vaga.cargo?.nome || "Cargo"} - {vaga.nivel}
                      </Text>
                    </Tooltip>
                    <Group justify="space-between" align="flex-start" wrap="nowrap" mt={6}>
                      <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                        <Group gap={4} wrap="nowrap" style={{ minWidth: 0 }}>
                          <IconUser size={14} color="var(--mantine-color-gray-5)" style={{ flexShrink: 0 }} />
                          <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {vaga.gestor}
                          </Text>
                        </Group>
                        <Group gap={4} wrap="nowrap" style={{ minWidth: 0 }}>
                          <IconMapPin size={14} color="var(--mantine-color-gray-5)" style={{ flexShrink: 0 }} />
                          <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {vaga.unidade}
                          </Text>
                        </Group>
                      </Group>
                      {vaga.quantidade > 1 && (
                        <Badge size="xs" variant="light" color="blue" style={{ flexShrink: 0 }}>
                          QTD: {vaga.quantidade}
                        </Badge>
                      )}
                    </Group>
                    {vaga.status === "Em Andamento" && (
                      <Group mt={6} onClick={(e) => e.stopPropagation()}>
                        <Menu position="bottom-start" shadow="md" withinPortal opened={isSubEtapaLocked ? false : adMenuOpened} onChange={(v) => { if (isSubEtapaLocked) return; setAdMenuOpened(v); }}>
                          <Menu.Target>
                            <UnstyledButton
                              disabled={isSubEtapaLocked}
                              onClick={(e) => { if (isSubEtapaLocked) { e.preventDefault(); e.stopPropagation(); return; } e.stopPropagation(); }}
                              title={isSubEtapaLocked ? "Use a barra de ações em lote para alterar sub-etapas" : undefined}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "4px 8px",
                                borderRadius: 6,
                                backgroundColor: "var(--mantine-color-gray-1)",
                                color: admissaoVencida ? "var(--mantine-color-red-7)" : "var(--mantine-color-gray-8)",
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: isSubEtapaLocked ? "not-allowed" : "pointer",
                                opacity: isSubEtapaLocked ? 0.55 : 1,
                                pointerEvents: isSubEtapaLocked ? "none" as any : undefined,
                                transition: "background-color 0.2s ease",
                              }}
                              onMouseEnter={(e) => { if (isSubEtapaLocked) return; e.currentTarget.style.backgroundColor = "var(--mantine-color-gray-2)"; }}
                              onMouseLeave={(e) => { if (isSubEtapaLocked) return; e.currentTarget.style.backgroundColor = "var(--mantine-color-gray-1)"; }}
                            >
                              {admissaoVencida && <Box w={6} h={6} bg="red" style={{ borderRadius: "50%", flexShrink: 0 }} />}
                              <span>{admissaoVencida ? "ADMISSÃO (PENDENTE)" : subEtapaDisplay}</span>
                              <IconChevronDown size={12} style={{ opacity: 0.6, flexShrink: 0 }} />
                            </UnstyledButton>
                          </Menu.Target>
                          <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
                            <Menu.Label>Sub-etapa</Menu.Label>
                            {SUB_ETAPAS.map((s) => (
                              <Menu.Item
                                key={s.value}
                                disabled={isSubEtapaLocked}
                                onClick={(e) => {
                                  if (isSubEtapaLocked) { e.stopPropagation(); return; }
                                  e.stopPropagation();
                                  if (s.value === "ADMISSAO") {
                                    setCandidatoNome((vaga as any).candidatoNome || "");
                                    setDataAdmissao((vaga as any).dataAdmissao ? String((vaga as any).dataAdmissao).slice(0, 10) : "");
                                    setShowAdmissaoCard(true);
                                    setAdMenuOpened(false);
                                  } else {
                                    onSubEtapa?.(vaga.id, s.value);
                                    setAdMenuOpened(false);
                                  }
                                }}
                              >
                                {formatarSubEtapa(s.label)}
                              </Menu.Item>
                            ))}
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    )}
                    {(vaga as any).subEtapa === "ADMISSAO" && (vaga as any).status !== "Em Andamento" && admissaoVencida && (
                      <Group mt={6} onClick={(e) => e.stopPropagation()}>
                        <UnstyledButton
                          onClick={(e) => { e.stopPropagation(); onDecisaoAdmissao?.(vaga); }}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "4px 8px",
                            borderRadius: 6,
                            backgroundColor: "var(--mantine-color-red-0)",
                            color: "var(--mantine-color-red-7)",
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          <Box w={6} h={6} bg="red" style={{ borderRadius: "50%", flexShrink: 0 }} />
                          ADMISSÃO (PENDENTE)
                        </UnstyledButton>
                      </Group>
                    )}
                    {vaga.status === "Concluído" && (vaga as any).candidatoNome && (
                      <Group gap={4} mt={6} wrap="nowrap" align="center">
                        <IconUserCheck size={12} color="var(--mantine-color-teal-6)" style={{ flexShrink: 0 }} />
                        <Text size="xs" c="teal" fw={500} truncate>Contratado: {(vaga as any).candidatoNome}</Text>
                      </Group>
                    )}
                  </Box>
                </Group>
              </Card>
            </Popover.Target>
            <Popover.Dropdown p={0} style={{ width: 300, border: "1px solid var(--mantine-color-gray-3)" }} onClick={(e) => e.stopPropagation()}>
              <Paper withBorder={false} radius="md" p="sm" shadow="none" style={{ width: 300 }}>
                <Stack gap="xs">
                  <Text size="xs" fw={700}>Processo de Admissão</Text>
                  <Text size="xs" c="dimmed">{vaga.cargo?.nome || "Cargo"} - {vaga.nivel}</Text>
                  <TextInput label="Nome do Candidato" placeholder="Nome completo" size="xs" value={candidatoNome} onChange={(e) => setCandidatoNome(e.currentTarget.value)} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} />
                  <TextInput label="Data Prevista de Admissão" placeholder="DD/MM/YYYY" size="xs" type="date" value={dataAdmissao} onChange={(e) => setDataAdmissao(e.currentTarget.value)} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} />
                  {dataVencida ? (
                    <>
                      <Divider />
                      <Text size="xs" fw={600}>Qual é o resultado da admissão?</Text>
                      <Radio.Group value={resultado} onChange={(v) => setResultado(v as any)} onClick={(e) => e.stopPropagation()}>
                        <Group gap="sm" mt={4}>
                          <Radio value="APROVADO" label="Aprovado" size="xs" />
                          <Radio value="REPROVADO" label="Reprovado" size="xs" />
                          <Radio value="DESISTENCIA" label="Desistência" size="xs" />
                        </Group>
                      </Radio.Group>
                      {resultado !== "APROVADO" && (
                        <>
                          <Select label="Retornar para etapa" data={RETORNO_OPTS as any} value={retorno} onChange={(v) => setRetorno(v || "ENTREVISTA")} size="xs" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} />
                          <Textarea label="Motivo" placeholder="Informe o motivo" size="xs" value={motivo} onChange={(e) => setMotivo(e.currentTarget.value)} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} minRows={2} />
                        </>
                      )}
                    </>
                  ) : dataAdmissao ? <Text size="xs" c="dimmed">Ficará pendente até {dataAdmissao.split("-").reverse().join("/")}. Use o sino para decidir.</Text> : null}
                  <Group gap="xs" justify="flex-end" mt="xs">
                    <Button size="xs" variant="subtle" onClick={(e) => { e.stopPropagation(); setShowAdmissaoCard(false); }}>Cancelar</Button>
                    <Button size="xs" color={dataVencida && resultado !== "APROVADO" ? "red" : "blue"} onClick={handleSalvarAdmissaoInline} loading={savingAdmissao} disabled={!candidatoNome.trim()}>{dataVencida ? (resultado === "APROVADO" ? "Aprovar e Concluir" : "Confirmar") : "Salvar"}</Button>
                  </Group>
                </Stack>
              </Paper>
            </Popover.Dropdown>
          </Popover>
        </Box>
      )}
    </Draggable>
  );
};
