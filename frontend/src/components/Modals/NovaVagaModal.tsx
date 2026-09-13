import { Button, Grid, Group, Modal, NumberInput, Radio, SegmentedControl, Select, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import { IconMapPin, IconUser } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import type { Cargo, NovaVagaPayload, Vaga } from "../../types/vaga";

interface NovaVagaModalProps {
  vagaInicial?: Vaga | null;
  onClose: () => void;
  onSubmit: (payload: NovaVagaPayload) => Promise<void>;
}

export const NovaVagaModal: React.FC<NovaVagaModalProps> = ({ vagaInicial, onClose, onSubmit }) => {
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [unidadesOpt, setUnidadesOpt] = useState<string[]>([]);
  const [gestoresOpt, setGestoresOpt] = useState<string[]>([]);
  const [cargoId, setCargoId] = useState<string>(vagaInicial ? String(vagaInicial.cargoId) : "");
  const [nivel, setNivel] = useState<string>(vagaInicial?.nivel || "Pleno");
  const [quantidade, setQuantidade] = useState<number>(vagaInicial?.quantidade || 1);
  const [unidade, setUnidade] = useState(vagaInicial?.unidade || "");
  const [categoria, setCategoria] = useState<string>((vagaInicial as any)?.cargo?.categoria || (vagaInicial as any)?.categoria || "ADMINISTRATIVO");
  void categoria;
  const [departamento, setDepartamento] = useState(vagaInicial?.departamento || "");
  const [centroDeCusto, setCentroDeCusto] = useState((vagaInicial as any)?.centroDeCusto || "");
  const [gestor, setGestor] = useState(vagaInicial?.gestor || "");
  const [recrutador, setRecrutador] = useState(vagaInicial?.recrutador || "");
  const [motivo, setMotivo] = useState<string>(vagaInicial?.motivo || "Substituição");
  const [tipoContrato, setTipoContrato] = useState<string>(vagaInicial?.tipoContrato || "CLT");
  const [cargaHoraria, setCargaHoraria] = useState(vagaInicial?.cargaHoraria || "44h semanais");
  const [slaDias, setSlaDias] = useState<number>(vagaInicial?.slaDias || 30);
  const [salario, setSalario] = useState<number | "">((vagaInicial as any)?.salario ?? "");
  const [loading, setLoading] = useState(false);
  const getSalarioRef = (cid: string, nv: string) => {
    const c = cargos.find((x) => String(x.id) === String(cid));
    if (!c) return null;
    if (nv === "Estágio") return c.salarioEstagio ?? null;
    if (nv === "Jr") return c.salarioJunior ?? null;
    if (nv === "Pleno") return c.salarioPleno ?? null;
    if (nv === "Senior") return c.salarioSenior ?? null;
    if (nv === "Coordenador") return c.salarioCoordenador ?? null;
    return null;
  };
  const aplicarSalario = (cid: string, nv: string) => {
    const v = getSalarioRef(cid, nv);
    if (v != null) setSalario(Number(v));
  };
  const aplicarHerancaCargo = (cid: string) => {
    const c = cargos.find((x) => String(x.id) === String(cid));
    if (!c) return;
    setCategoria(String((c as any).categoria || "ADMINISTRATIVO"));
    if ((c as any).departamento) setDepartamento(String((c as any).departamento));
    if ((c as any).centroDeCusto) setCentroDeCusto(String((c as any).centroDeCusto));
    setSlaDias(Number((c as any).slaPadrao ?? 30));
    if ((c as any).cargaHoraria) setCargaHoraria(String((c as any).cargaHoraria));
    aplicarSalario(cid, nivel);
  };

  useEffect(() => {
    carregarCargos();
    carregarParametros();
  }, []);

  const carregarParametros = async () => {
    try {
      const [u, g] = await Promise.all([api.getUnidades(), api.getGestores()]);
      setUnidadesOpt(u.map((x) => x.nome));
      setGestoresOpt(g.map((x) => x.nome));
    } catch {}
  };

  const carregarCargos = async () => {
    try {
      const lista = await api.getCargos();
      setCargos(lista);
      if (!vagaInicial && lista.length > 0 && !cargoId) {
        const firstId = String(lista[0].id);
        setCargoId(firstId);
        const v = (() => {
          const c = lista[0] as any;
          if (nivel === "Estágio") return c.salarioEstagio;
          if (nivel === "Jr") return c.salarioJunior;
          if (nivel === "Pleno") return c.salarioPleno;
          if (nivel === "Senior") return c.salarioSenior;
          if (nivel === "Coordenador") return c.salarioCoordenador;
          return null;
        })();
        if (v != null) setSalario(Number(v));
      }
    } catch (error) {
      console.error("Erro ao carregar cargos:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cargoId || loading) return;
    if (!unidade.trim() || !departamento.trim() || !gestor.trim() || !recrutador.trim()) return;
    setLoading(true);
    try {
      await onSubmit({
        cargoId: String(cargoId) as any,
        nivel: nivel as any,
        quantidade: Number(quantidade),
        unidade,
        departamento,
        centroDeCusto: centroDeCusto.trim() || null,
        gestor,
        recrutador,
        motivo: motivo as any,
        tipoContrato: tipoContrato as any,
        cargaHoraria,
        salario: salario === "" ? null : Number(salario),
        slaDias: Number(slaDias),
      } as any);
    } catch (error) {
      console.error("Erro ao salvar vaga:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened onClose={onClose} size="lg" centered radius="md" padding="md" withCloseButton title={<Text fw={700} size="sm">{vagaInicial ? "Editar Vaga" : "Nova Requisição de Vaga"}</Text>}>
      <form onSubmit={handleSubmit}>
        <Stack gap="sm">
          <Grid gap="sm">
            <Grid.Col span={6}>
              <Radio.Group label="Tipo de Vaga" value={motivo} onChange={setMotivo}>
                <Group gap="md" mt={4}>
                  <Radio value="Substituição" label="Substituição" size="xs" />
                  <Radio value="Aumento de Quadro" label="Aumento de Quadro" size="xs" />
                </Group>
              </Radio.Group>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="sm" fw={500} mb={4}>Nível</Text>
              <SegmentedControl fullWidth size="xs" value={nivel} onChange={(v) => { setNivel(v); aplicarSalario(cargoId, v); }} data={["Jr", "Pleno", "Senior", "Estágio", "Coordenador"]} />
            </Grid.Col>
          </Grid>

          <Select label="Cargo *" placeholder="Selecione o cargo" data={cargos.map((c) => ({ value: String(c.id), label: c.nome }))} value={cargoId} onChange={(val) => { const v = val || ""; setCargoId(v); aplicarHerancaCargo(v); }} searchable size="sm" />

          <SimpleGrid cols={3} spacing="sm">
            <NumberInput label="Qtd. Vagas" size="sm" value={quantidade} onChange={(val) => setQuantidade(Number(val) || 1)} min={1} />
            <NumberInput label="SLA (Dias)" size="sm" value={slaDias} onChange={(val) => setSlaDias(Number(val) || 30)} min={1} />
            <Select label="Tipo de Contrato" size="sm" value={tipoContrato} onChange={(val) => setTipoContrato(val || "CLT")} data={["CLT", "PJ", "Estágio", "Temporário"]} />
          </SimpleGrid>

          <SimpleGrid cols={2} spacing="sm">
            <Select label="Gestor" placeholder="Selecione o gestor" required size="sm" data={gestoresOpt} value={gestor || null} onChange={(v) => setGestor(v || "")} searchable leftSection={<IconUser size={14} />} nothingFoundMessage="Nenhum gestor cadastrado" />
            <Select label="Unidade" placeholder="Ex: Matriz SP" required size="sm" data={unidadesOpt} value={unidade || null} onChange={(v) => setUnidade(v || "")} searchable leftSection={<IconMapPin size={14} />} nothingFoundMessage="Nenhuma unidade cadastrada" />
          </SimpleGrid>

          <SimpleGrid cols={2} spacing="sm">
            <TextInput label="Departamento" placeholder="Ex: Financeiro" required size="sm" value={departamento} onChange={(e) => setDepartamento(e.target.value)} />
            <TextInput label="Recrutador" placeholder="Nome do recrutador" required size="sm" value={recrutador} onChange={(e) => setRecrutador(e.target.value)} />
          </SimpleGrid>

          <TextInput label="Centro de Custo" placeholder="CC-1020 - RH" size="sm" value={centroDeCusto} onChange={(e) => setCentroDeCusto(e.target.value)} />
          <SimpleGrid cols={2} spacing="sm">
            <NumberInput label="Salário" placeholder="Auto por nível" size="sm" value={salario} onChange={(v) => setSalario(v === "" ? "" : Number(v) as any)} prefix="R$ " thousandSeparator="." decimalSeparator="," />
            <TextInput label="Carga Horária" placeholder="Ex: 44h semanais" size="sm" value={cargaHoraria} onChange={(e) => setCargaHoraria(e.target.value)} />
          </SimpleGrid>

          <Group justify="space-between" mt="xs">
            <Button variant="subtle" color="gray" type="button" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" loading={loading} color="blue">Criar Requisição</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
