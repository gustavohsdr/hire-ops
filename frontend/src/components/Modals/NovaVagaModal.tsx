import { Box, Button, Grid, Group, Modal, NumberInput, Paper, SegmentedControl, Select, Stack, Stepper, Text, TextInput } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import type { Cargo, NovaVagaPayload, Vaga } from "../../types/vaga";

interface NovaVagaModalProps {
  vagaInicial?: Vaga | null;
  onClose: () => void;
  onSubmit: (payload: NovaVagaPayload) => Promise<void>;
}

export const NovaVagaModal: React.FC<NovaVagaModalProps> = ({ vagaInicial, onClose, onSubmit }) => {
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [novoCargoNome, setNovoCargoNome] = useState("");
  const [criandoCargo, setCriandoCargo] = useState(false);
  const [cargoId, setCargoId] = useState<string>(vagaInicial ? String(vagaInicial.cargoId) : "");
  const [nivel, setNivel] = useState<string>(vagaInicial?.nivel || "Pleno");
  const [quantidade, setQuantidade] = useState<number>(vagaInicial?.quantidade || 1);
  const [unidade, setUnidade] = useState(vagaInicial?.unidade || "");
  const [departamento, setDepartamento] = useState(vagaInicial?.departamento || "");
  const [gestor, setGestor] = useState(vagaInicial?.gestor || "");
  const [recrutador, setRecrutador] = useState(vagaInicial?.recrutador || "");
  const [motivo, setMotivo] = useState<string>(vagaInicial?.motivo || "Substituição");
  const [tipoContrato, setTipoContrato] = useState<string>(vagaInicial?.tipoContrato || "CLT");
  const [cargaHoraria, setCargaHoraria] = useState(vagaInicial?.cargaHoraria || "44h semanais");
  const [slaDias, setSlaDias] = useState<number>(vagaInicial?.slaDias || 30);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    carregarCargos();
  }, []);

  const carregarCargos = async () => {
    try {
      const lista = await api.getCargos();
      setCargos(lista);
      if (!vagaInicial && lista.length > 0 && !cargoId) setCargoId(String(lista[0].id));
    } catch (error) {
      console.error("Erro ao carregar cargos:", error);
    }
  };

  const handleCriarCargo = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!novoCargoNome.trim()) return;
    try {
      const novo = await api.createCargo(novoCargoNome.trim());
      setCargos((prev) => [...prev, novo]);
      setCargoId(String(novo.id));
      setNovoCargoNome("");
      setCriandoCargo(false);
    } catch (error) {
      console.error("Erro ao criar cargo:", error);
    }
  };

  const validStep0 = !!cargoId && quantidade >= 1 && slaDias >= 1 && !!nivel && !!tipoContrato;
  const validStep1 = unidade.trim() !== "" && departamento.trim() !== "" && gestor.trim() !== "" && recrutador.trim() !== "";

  const handleNext = () => {
    if (step === 0 && !validStep0) return;
    if (step === 1 && !validStep1) return;
    setStep((s) => Math.min(s + 1, 2));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      handleNext();
      return;
    }
    if (!cargoId || loading) return;
    if (!validStep0 || !validStep1) {
      if (!validStep0) setStep(0);
      else if (!validStep1) setStep(1);
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        cargoId: Number(cargoId),
        nivel: nivel as any,
        quantidade: Number(quantidade),
        unidade,
        departamento,
        gestor,
        recrutador,
        motivo: motivo as any,
        tipoContrato: tipoContrato as any,
        cargaHoraria,
        slaDias: Number(slaDias),
      });
    } catch (error) {
      console.error("Erro ao salvar vaga:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened
      onClose={onClose}
      size="lg"
      centered
      radius="md"
      padding="xl"
      withCloseButton
      title={
        <div>
          <Text fw={700} size="lg">
            {vagaInicial ? (vagaInicial.id ? "Editar Vaga" : "Duplicar Vaga") : "Nova Requisição de Vaga"}
          </Text>
          <Text size="xs" c="dimmed">Preencha os dados abaixo para iniciar o processo seletivo</Text>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Stepper active={step} size="xs" allowNextStepsSelect={false} onStepClick={setStep}>
            <Stepper.Step label="1. Perfil" />
            <Stepper.Step label="2. Estrutura" />
            <Stepper.Step label="3. Condições" />
          </Stepper>

          <Box mih={270}>
            <Paper withBorder p="md" radius="lg" style={{ borderColor: "#e5e7eb" }}>
              {step === 0 && (
                <Stack gap="md">
                  <Text size="xs" fw={700} tt="uppercase">1. PERFIL DA VAGA</Text>
                  {!criandoCargo ? (
                    <div>
                      <Group justify="space-between" mb={4}>
                        <Text size="sm" fw={500}>Cargo *</Text>
                        <Button variant="subtle" size="compact-xs" type="button" onClick={() => setCriandoCargo(true)}>
                          + Cadastrar novo cargo
                        </Button>
                      </Group>
                      <Select
                        placeholder="Selecione o cargo base"
                        data={cargos.map((c) => ({ value: String(c.id), label: c.nome }))}
                        value={cargoId}
                        onChange={(val) => setCargoId(val || "")}
                        searchable
                      />
                    </div>
                  ) : (
                    <div>
                      <Text size="sm" fw={500} mb={4}>Cadastrar Novo Cargo</Text>
                      <Group gap="xs">
                        <TextInput placeholder="Nome do cargo (ex: Analista Fiscal)" style={{ flex: 1 }} value={novoCargoNome} onChange={(e) => setNovoCargoNome(e.target.value)} autoFocus />
                        <Button size="sm" type="button" onClick={handleCriarCargo}>Salvar</Button>
                        <Button size="sm" variant="default" type="button" onClick={() => setCriandoCargo(false)}>Cancelar</Button>
                      </Group>
                    </div>
                  )}
                  <div>
                    <Text size="sm" fw={500} mb={6}>Nível / Sênioridade</Text>
                    <SegmentedControl fullWidth value={nivel} onChange={setNivel} data={["Jr", "Pleno", "Senior", "Estágio", "Coordenador"]} />
                  </div>
                  <Grid>
                    <Grid.Col span={4}><NumberInput label="Qtd. Vagas" value={quantidade} onChange={(val) => setQuantidade(Number(val) || 1)} min={1} /></Grid.Col>
                    <Grid.Col span={4}><NumberInput label="SLA (Dias)" value={slaDias} onChange={(val) => setSlaDias(Number(val) || 30)} min={1} /></Grid.Col>
                    <Grid.Col span={4}><Select label="Contrato" value={tipoContrato} onChange={(val) => setTipoContrato(val || "CLT")} data={["CLT", "PJ", "Estágio", "Temporário"]} /></Grid.Col>
                  </Grid>
                </Stack>
              )}

              {step === 1 && (
                <Stack gap="md">
                  <Text size="xs" fw={700} tt="uppercase">2. ESTRUTURA ORGANIZACIONAL</Text>
                  <Grid>
                    <Grid.Col span={6}><TextInput label="Unidade / Filial" placeholder="Ex: Matriz SP" required value={unidade} onChange={(e) => setUnidade(e.target.value)} /></Grid.Col>
                    <Grid.Col span={6}><TextInput label="Departamento" placeholder="Ex: Financeiro" required value={departamento} onChange={(e) => setDepartamento(e.target.value)} /></Grid.Col>
                    <Grid.Col span={6}><TextInput label="Gestor Solicitante" placeholder="Nome do gestor" required value={gestor} onChange={(e) => setGestor(e.target.value)} /></Grid.Col>
                    <Grid.Col span={6}><TextInput label="Recrutador Responsável" placeholder="Nome do recrutador" required value={recrutador} onChange={(e) => setRecrutador(e.target.value)} /></Grid.Col>
                  </Grid>
                </Stack>
              )}

              {step === 2 && (
                <Stack gap="md">
                  <Text size="xs" fw={700} tt="uppercase">3. CONDIÇÕES</Text>
                  <div>
                    <Text size="sm" fw={500} mb={6}>Motivo da Abertura</Text>
                    <SegmentedControl fullWidth value={motivo} onChange={setMotivo} data={["Substituição", "Aumento de Quadro"]} />
                  </div>
                  <TextInput label="Carga Horária / Escala" placeholder="Ex: Segunda a Sexta - 08:00 às 17:00" value={cargaHoraria} onChange={(e) => setCargaHoraria(e.target.value)} />
                </Stack>
              )}
            </Paper>
          </Box>

          <Group justify="space-between" mt="md" style={{ position: "sticky", bottom: 0, background: "white", paddingTop: 8 }}>
            {step < 2 ? (
              <>
                <Button variant="subtle" color="gray" type="button" onClick={onClose} disabled={loading}>Cancelar</Button>
                <Button type="submit" radius="md" disabled={step === 0 ? !validStep0 : !validStep1}>Avançar &gt;</Button>
              </>
            ) : (
              <>
                <Button variant="default" type="button" onClick={handleBack} disabled={loading}>&lt; Voltar</Button>
                <Button type="submit" loading={loading} radius="md">Cadastrar Vaga</Button>
              </>
            )}
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
