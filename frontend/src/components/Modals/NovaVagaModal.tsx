import {
  Button,
  Fieldset,
  Grid,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import type { Cargo, NovaVagaPayload } from "../../types/vaga";

interface NovaVagaModalProps {
  onClose: () => void;
  onSubmit: (payload: NovaVagaPayload) => Promise<void>;
}

export const NovaVagaModal: React.FC<NovaVagaModalProps> = ({
  onClose,
  onSubmit,
}) => {
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [cargoId, setCargoId] = useState<string>("");
  const [novoCargoNome, setNovoCargoNome] = useState("");
  const [criandoCargo, setCriandoCargo] = useState(false);

  const [nivel, setNivel] = useState<string>("Pleno");
  const [quantidade, setQuantidade] = useState<number>(1);
  const [unidade, setUnidade] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [gestor, setGestor] = useState("");
  const [recrutador, setRecrutador] = useState("");
  const [motivo, setMotivo] = useState<string>("Substituição");
  const [tipoContrato, setTipoContrato] = useState<string>("CLT");
  const [cargaHoraria, setCargaHoraria] = useState("44h semanais");
  const [slaDias, setSlaDias] = useState<number>(30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarCargos();
  }, []);

  const carregarCargos = async () => {
    const lista = await api.getCargos();
    setCargos(lista);
    if (lista.length > 0) setCargoId(String(lista[0].id));
  };

  const handleCriarCargo = async () => {
    if (!novoCargoNome.trim()) return;
    const novo = await api.createCargo(novoCargoNome.trim());
    setCargos((prev) => [...prev, novo]);
    setCargoId(String(novo.id));
    setNovoCargoNome("");
    setCriandoCargo(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cargoId) return;
    setLoading(true);
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
    setLoading(false);
  };

  return (
    <Modal
      opened
      onClose={onClose}
      title="➕ Cadastrar Nova Vaga"
      size="lg"
      centered
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Fieldset legend="1. Informações Básicas do Cargo">
            <Grid>
              <Grid.Col span={6}>
                {!criandoCargo ? (
                  <Group align="flex-end">
                    <Select
                      label="Cargo *"
                      style={{ flex: 1 }}
                      data={cargos.map((c) => ({
                        value: String(c.id),
                        label: c.nome,
                      }))}
                      value={cargoId}
                      onChange={(val) => setCargoId(val || "")}
                    />
                    <Button
                      variant="light"
                      onClick={() => setCriandoCargo(true)}
                    >
                      + Novo
                    </Button>
                  </Group>
                ) : (
                  <Group align="flex-end">
                    <TextInput
                      label="Novo Cargo"
                      style={{ flex: 1 }}
                      value={novoCargoNome}
                      onChange={(e) => setNovoCargoNome(e.target.value)}
                    />
                    <Button onClick={handleCriarCargo}>Salvar</Button>
                    <Button
                      variant="subtle"
                      onClick={() => setCriandoCargo(false)}
                    >
                      Cancelar
                    </Button>
                  </Group>
                )}
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Nível / Sênioridade"
                  value={nivel}
                  onChange={(val) => setNivel(val || "Pleno")}
                  data={["Jr", "Pleno", "Sr", "Estágio", "Coordenador"]}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label="Qtd. Vagas"
                  value={quantidade}
                  onChange={(val) => setQuantidade(Number(val))}
                  min={1}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label="SLA (dias)"
                  value={slaDias}
                  onChange={(val) => setSlaDias(Number(val))}
                  min={1}
                />
              </Grid.Col>
            </Grid>
          </Fieldset>

          <Fieldset legend="2. Estrutura Organizacional">
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Unidade *"
                  required
                  value={unidade}
                  onChange={(e) => setUnidade(e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Departamento *"
                  required
                  value={departamento}
                  onChange={(e) => setDepartamento(e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Gestor Solicitante *"
                  required
                  value={gestor}
                  onChange={(e) => setGestor(e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Recrutador Responsável *"
                  required
                  value={recrutador}
                  onChange={(e) => setRecrutador(e.target.value)}
                />
              </Grid.Col>
            </Grid>
          </Fieldset>

          <Fieldset legend="3. Condições de Contratação">
            <Grid>
              <Grid.Col span={6}>
                <Select
                  label="Tipo de Contrato"
                  value={tipoContrato}
                  onChange={(val) => setTipoContrato(val || "CLT")}
                  data={["CLT", "PJ", "Estágio", "Temporário"]}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Motivo da Abertura"
                  value={motivo}
                  onChange={(val) => setMotivo(val || "Substituição")}
                  data={["Substituição", "Aumento de Quadro"]}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <TextInput
                  label="Carga Horária"
                  value={cargaHoraria}
                  onChange={(e) => setCargaHoraria(e.target.value)}
                />
              </Grid.Col>
            </Grid>
          </Fieldset>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              Cadastrar Vaga
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
