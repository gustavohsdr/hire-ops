import {
  Button,
  Divider,
  Grid,
  Group,
  Modal,
  NumberInput,
  SegmentedControl,
  Select,
  Stack,
  Text,
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
      title={
        <div>
          <Text fw={700} size="lg">
            Nova Requisição de Vaga
          </Text>
          <Text size="xs" c="dimmed">
            Preencha os dados abaixo para iniciar o processo seletivo
          </Text>
        </div>
      }
      size="lg"
      centered
      radius="md"
      padding="xl"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          {/* SEÇÃO 1: PERFIL DA VAGA */}
          <div>
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={1} mb="xs">
              1. Perfil da Vaga
            </Text>

            <Grid gutter="md">
              <Grid.Col span={12}>
                {!criandoCargo ? (
                  <div>
                    <Group justify="space-between" mb={4}>
                      <Text size="sm" fw={500}>
                        Cargo *
                      </Text>
                      <Button
                        variant="subtle"
                        size="compact-xs"
                        onClick={() => setCriandoCargo(true)}
                      >
                        + Cadastrar novo cargo
                      </Button>
                    </Group>
                    <Select
                      placeholder="Selecione o cargo base"
                      data={cargos.map((c) => ({
                        value: String(c.id),
                        label: c.nome,
                      }))}
                      value={cargoId}
                      onChange={(val) => setCargoId(val || "")}
                      searchable
                    />
                  </div>
                ) : (
                  <div>
                    <Text size="sm" fw={500} mb={4}>
                      Cadastrar Novo Cargo
                    </Text>
                    <Group gap="xs">
                      <TextInput
                        placeholder="Nome do cargo (ex: Analista Fiscal)"
                        style={{ flex: 1 }}
                        value={novoCargoNome}
                        onChange={(e) => setNovoCargoNome(e.target.value)}
                        autoFocus
                      />
                      <Button size="sm" onClick={handleCriarCargo}>
                        Salvar
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => setCriandoCargo(false)}
                      >
                        Cancelar
                      </Button>
                    </Group>
                  </div>
                )}
              </Grid.Col>

              <Grid.Col span={12}>
                <Text size="sm" fw={500} mb={6}>
                  Nível / Sênioridade
                </Text>
                <SegmentedControl
                  fullWidth
                  value={nivel}
                  onChange={setNivel}
                  data={["Jr", "Pleno", "Sr", "Estágio", "Coordenador"]}
                />
              </Grid.Col>

              <Grid.Col span={4}>
                <NumberInput
                  label="Qtd. Vagas"
                  value={quantidade}
                  onChange={(val) => setQuantidade(Number(val) || 1)}
                  min={1}
                />
              </Grid.Col>

              <Grid.Col span={4}>
                <NumberInput
                  label="SLA (Dias)"
                  value={slaDias}
                  onChange={(val) => setSlaDias(Number(val) || 30)}
                  min={1}
                />
              </Grid.Col>

              <Grid.Col span={4}>
                <Select
                  label="Contrato"
                  value={tipoContrato}
                  onChange={(val) => setTipoContrato(val || "CLT")}
                  data={["CLT", "PJ", "Estágio", "Temporário"]}
                />
              </Grid.Col>
            </Grid>
          </div>

          <Divider color="gray.2" />

          {/* SEÇÃO 2: ESTRUTURA ORGANIZACIONAL */}
          <div>
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={1} mb="xs">
              2. Estrutura Organizacional
            </Text>

            <Grid gutter="md">
              <Grid.Col span={6}>
                <TextInput
                  label="Unidade / Filial"
                  placeholder="Ex: Matriz SP"
                  required
                  value={unidade}
                  onChange={(e) => setUnidade(e.target.value)}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <TextInput
                  label="Departamento"
                  placeholder="Ex: Financeiro"
                  required
                  value={departamento}
                  onChange={(e) => setDepartamento(e.target.value)}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <TextInput
                  label="Gestor Solicitante"
                  placeholder="Nome do gestor"
                  required
                  value={gestor}
                  onChange={(e) => setGestor(e.target.value)}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <TextInput
                  label="Recrutador Responsável"
                  placeholder="Nome do recrutador"
                  required
                  value={recrutador}
                  onChange={(e) => setRecrutador(e.target.value)}
                />
              </Grid.Col>
            </Grid>
          </div>

          <Divider color="gray.2" />

          {/* SEÇÃO 3: CONDIÇÕES E MOTIVO */}
          <div>
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={1} mb="xs">
              3. Condições
            </Text>

            <Grid gutter="md">
              <Grid.Col span={12}>
                <Text size="sm" fw={500} mb={6}>
                  Motivo da Abertura
                </Text>
                <SegmentedControl
                  fullWidth
                  value={motivo}
                  onChange={setMotivo}
                  data={["Substituição", "Aumento de Quadro"]}
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <TextInput
                  label="Carga Horária / Escala"
                  placeholder="Ex: Segunda a Sexta - 08:00 às 17:00"
                  value={cargaHoraria}
                  onChange={(e) => setCargaHoraria(e.target.value)}
                />
              </Grid.Col>
            </Grid>
          </div>

          {/* RODAPÉ */}
          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              color="gray"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={loading} radius="md">
              Cadastrar Vaga
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
