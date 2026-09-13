import { ActionIcon, Button, Group, Modal, NumberInput, Select, SimpleGrid, Stack, TextInput } from "@mantine/core";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import type { Cargo } from "../../types/vaga";

interface Props {
  opened: boolean;
  onClose: () => void;
  cargo: Cargo | null;
  onSave: (payload: Partial<Cargo> & { nome: string }) => Promise<void>;
}

export function CargoModal({ opened, onClose, cargo, onSave }: Props) {
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("ADMINISTRATIVO");
  const [departamento, setDepartamento] = useState("");
  const [centroDeCusto, setCentroDeCusto] = useState("");
  const [slaPadrao, setSlaPadrao] = useState(30);
  const [cargaHoraria, setCargaHoraria] = useState("");
  const [salEstagio, setSalEstagio] = useState<number | "">("");
  const [salJr, setSalJr] = useState<number | "">("");
  const [salPl, setSalPl] = useState<number | "">("");
  const [salSr, setSalSr] = useState<number | "">("");
  const [salCoord, setSalCoord] = useState<number | "">("");
  const [showSalarios, setShowSalarios] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (opened) {
      setShowSalarios(false);
      if (cargo) {
        setNome(cargo.nome);
        setCategoria(cargo.categoria);
        setDepartamento((cargo as any).departamento ?? "");
        setCentroDeCusto((cargo as any).centroDeCusto ?? "");
        setSlaPadrao(cargo.slaPadrao);
        setCargaHoraria((cargo as any).cargaHoraria ?? "");
        setSalEstagio(cargo.salarioEstagio ?? "");
        setSalJr(cargo.salarioJunior ?? "");
        setSalPl(cargo.salarioPleno ?? "");
        setSalSr(cargo.salarioSenior ?? "");
        setSalCoord(cargo.salarioCoordenador ?? "");
      } else {
        setNome("");
        setCategoria("ADMINISTRATIVO");
        setDepartamento("");
        setCentroDeCusto("");
        setSlaPadrao(30);
        setCargaHoraria("");
        setSalEstagio("");
        setSalJr("");
        setSalPl("");
        setSalSr("");
        setSalCoord("");
      }
    }
  }, [opened, cargo]);

  const handleSave = async () => {
    if (!nome.trim() || loading) return;
    setLoading(true);
    try {
      await onSave({
        nome: nome.trim(),
        categoria: categoria as any,
        departamento: departamento.trim() || null,
        centroDeCusto: centroDeCusto.trim() || null,
        slaPadrao: Number(slaPadrao),
        cargaHoraria: cargaHoraria.trim() || null,
        salarioEstagio: salEstagio === "" ? null : Number(salEstagio),
        salarioJunior: salJr === "" ? null : Number(salJr),
        salarioPleno: salPl === "" ? null : Number(salPl),
        salarioSenior: salSr === "" ? null : Number(salSr),
        salarioCoordenador: salCoord === "" ? null : Number(salCoord),
      } as any);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const eyeButton = (
    <ActionIcon variant="subtle" color="gray" onClick={() => setShowSalarios((v) => !v)} aria-label={showSalarios ? "Ocultar salários" : "Mostrar salários"}>
      {showSalarios ? <IconEyeOff size={16} /> : <IconEye size={16} />}
    </ActionIcon>
  );

  const maskedStyles = showSalarios ? undefined : ({ input: { WebkitTextSecurity: "disc" } } as any);

  return (
    <Modal opened={opened} onClose={onClose} title={cargo ? "Editar Cargo" : "Novo Cargo"} centered size="lg" padding="md">
      <Stack gap="sm">
        <TextInput label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        <SimpleGrid cols={2} spacing="md">
          <Select label="Categoria" value={categoria} onChange={(v) => setCategoria(v || "ADMINISTRATIVO")} data={["ADMINISTRATIVO", "OPERACIONAL"]} />
          <TextInput label="Departamento" placeholder="Ex: Financeiro" value={departamento} onChange={(e) => setDepartamento(e.target.value)} />
        </SimpleGrid>
        <SimpleGrid cols={2} spacing="md">
          <NumberInput label="SLA Padrão (dias)" value={slaPadrao} onChange={(v) => setSlaPadrao(Number(v) || 30)} min={1} />
          <TextInput label="Carga Horária" placeholder="Ex: 44h semanais" value={cargaHoraria} onChange={(e) => setCargaHoraria(e.target.value)} />
        </SimpleGrid>
        <TextInput label="Centro de Custo" placeholder="CC-1020 - RH" value={centroDeCusto} onChange={(e) => setCentroDeCusto(e.target.value)} />
        <SimpleGrid cols={2} spacing="md">
          <NumberInput label="Bolsa Estágio" value={salEstagio} onChange={(v) => setSalEstagio(v === "" ? "" : Number(v) as any)} placeholder="Opcional" prefix="R$ " thousandSeparator="." decimalSeparator="," rightSection={eyeButton} styles={maskedStyles} />
          <NumberInput label="Salário Júnior" value={salJr} onChange={(v) => setSalJr(v === "" ? "" : Number(v) as any)} placeholder="Opcional" prefix="R$ " thousandSeparator="." decimalSeparator="," rightSection={eyeButton} styles={maskedStyles} />
          <NumberInput label="Salário Pleno" value={salPl} onChange={(v) => setSalPl(v === "" ? "" : Number(v) as any)} placeholder="Opcional" prefix="R$ " thousandSeparator="." decimalSeparator="," rightSection={eyeButton} styles={maskedStyles} />
          <NumberInput label="Salário Sênior" value={salSr} onChange={(v) => setSalSr(v === "" ? "" : Number(v) as any)} placeholder="Opcional" prefix="R$ " thousandSeparator="." decimalSeparator="," rightSection={eyeButton} styles={maskedStyles} />
        </SimpleGrid>
        <NumberInput label="Salário Coordenador" value={salCoord} onChange={(v) => setSalCoord(v === "" ? "" : Number(v) as any)} placeholder="Opcional" prefix="R$ " thousandSeparator="." decimalSeparator="," rightSection={eyeButton} styles={maskedStyles} />
        <Group justify="flex-end">
          <Button variant="subtle" color="gray" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSave} loading={loading}>Salvar</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
