import { AppShell, Group, SegmentedControl, Select, Stack, Text, Title } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { KanbanBoard } from "./components/Kanban/KanbanBoard";
import { AppHeader } from "./components/Layout/AppHeader";
import { AppSidebar } from "./components/Layout/AppSidebar";
import { MetricasBar } from "./components/MetricasBar";
import { ConfirmarExclusaoModal } from "./components/Modals/ConfirmarExclusaoModal";
import { MoverVagaModal } from "./components/Modals/MoverVagaModal";
import { NovaVagaModal } from "./components/Modals/NovaVagaModal";
import { VagasTable } from "./components/VagasTable";
import { api } from "./services/api";
import type { NovaVagaPayload, StatusVaga, Vaga } from "./types/vaga";

export function App() {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [modalAberta, setModalAberta] = useState(false);
  const [vagaSelecionada, setVagaSelecionada] = useState<Vaga | null>(null);
  const [modoModal, setModoModal] = useState<"criar" | "editar" | "duplicar">("criar");
  const [vagaParaExcluir, setVagaParaExcluir] = useState<Vaga | null>(null);
  const [pendingDrag, setPendingDrag] = useState<{ vaga: Vaga; novoStatus: StatusVaga } | null>(null);
  const [busca, setBusca] = useState("");
  const [sidebarOpened, setSidebarOpened] = useState(false);
  const [visao, setVisao] = useState<"kanban" | "tabela">("kanban");
  const [filtroUnidade, setFiltroUnidade] = useState<string | null>(null);

  const carregarVagas = async () => {
    const dados = await api.getVagas();
    setVagas(dados);
  };

  useEffect(() => {
    carregarVagas();
  }, []);

  const vagasFiltradas = useMemo(() => {
    let list = vagas;
    if (busca.trim()) {
      const q = busca.toLowerCase();
      list = list.filter((v) => `${v.cargo.nome} ${v.gestor} ${v.unidade} ${v.departamento}`.toLowerCase().includes(q));
    }
    if (filtroUnidade) list = list.filter((v) => v.unidade === filtroUnidade);
    return list;
  }, [vagas, busca, filtroUnidade]);

  const unidades = useMemo(() => [...new Set(vagas.map((v) => v.unidade))].filter(Boolean), [vagas]);

  const handleAbrirCriar = () => {
    setVagaSelecionada(null);
    setModoModal("criar");
    setModalAberta(true);
  };

  const handleEditar = (vaga: Vaga) => {
    setVagaSelecionada(vaga);
    setModoModal("editar");
    setModalAberta(true);
  };

  const handleDuplicar = (vaga: Vaga) => {
    setVagaSelecionada(vaga);
    setModoModal("duplicar");
    setModalAberta(true);
  };

  const confirmarExclusao = async () => {
    if (!vagaParaExcluir) return;
    await api.deleteVaga(vagaParaExcluir.id);
    setVagas((prev) => prev.filter((v) => v.id !== vagaParaExcluir.id));
    setVagaParaExcluir(null);
  };

  const isMesmoNegocio = (a: Vaga, b: Vaga) => a.cargoId === b.cargoId && a.gestor === b.gestor && a.departamento === b.departamento && a.unidade === b.unidade;

  const executarMoverTodas = async (id: number, novoStatus: StatusVaga) => {
    const dragged = vagas.find((v) => v.id === id);
    const destinoExistente = dragged ? vagas.find((v) => v.status === novoStatus && v.id !== id && isMesmoNegocio(v, dragged)) : null;
    if (destinoExistente && dragged) {
      setVagas((prev) => prev.filter((v) => v.id !== id).map((v) => (v.id === destinoExistente.id ? { ...v, quantidade: v.quantidade + dragged.quantidade } : v)));
    } else {
      setVagas((vagasAtuais) => vagasAtuais.map((v) => (v.id === id ? { ...v, status: novoStatus, dataFinalizacao: novoStatus === "Concluído" ? new Date().toISOString() : null } : v)));
    }
    try {
      const res = await api.updateStatus(id, novoStatus);
      if (res.agrupado) {
        setVagas((prev) => {
          let next = prev.filter((v) => v.id !== res.removidoId);
          return next.map((v) => (v.id === res.destino.id ? res.destino : v));
        });
      } else {
        setVagas((prev) => prev.map((v) => (v.id === res.vaga.id ? res.vaga : v)));
      }
    } catch (error) {
      console.error("Erro ao atualizar o status da vaga:", error);
      carregarVagas();
    }
  };

  const handleMudarStatus = async (id: number, novoStatus: StatusVaga) => {
    const vaga = vagas.find((v) => v.id === id);
    if (!vaga || vaga.status === novoStatus) return;
    if (vaga.quantidade > 1) {
      setPendingDrag({ vaga, novoStatus });
      return;
    }
    await executarMoverTodas(id, novoStatus);
  };

  const handleMoverTodas = async () => {
    if (!pendingDrag) return;
    const { vaga, novoStatus } = pendingDrag;
    setPendingDrag(null);
    await executarMoverTodas(vaga.id, novoStatus);
  };

  const handleMoverParcial = async (qtdMover: number) => {
    if (!pendingDrag) return;
    const { vaga, novoStatus } = pendingDrag;
    setPendingDrag(null);
    const destinoExistente = vagas.find((v) => v.status === novoStatus && v.id !== vaga.id && isMesmoNegocio(v, vaga));
    let tempId: number | null = null;
    if (destinoExistente) {
      setVagas((prev) =>
        prev.map((v) => {
          if (v.id === vaga.id) return { ...v, quantidade: v.quantidade - qtdMover };
          if (v.id === destinoExistente.id) return { ...v, quantidade: v.quantidade + qtdMover };
          return v;
        }),
      );
    } else {
      tempId = Date.now();
      setVagas((prev) => {
        const origemAtualizada = { ...vaga, quantidade: vaga.quantidade - qtdMover };
        const novaTemp: Vaga = { ...vaga, id: tempId!, quantidade: qtdMover, status: novoStatus, dataFinalizacao: novoStatus === "Concluído" ? new Date().toISOString() : null };
        return prev.map((v) => (v.id === vaga.id ? origemAtualizada : v)).concat(novaTemp);
      });
    }
    try {
      const res = await api.desmembrarVaga(vaga.id, qtdMover, novoStatus);
      if (res.agrupado) {
        setVagas((prev) => {
          let next = prev.map((v) => (v.id === res.origem.id ? res.origem : v.id === res.destino.id ? res.destino : v));
          if (tempId) next = next.filter((v) => v.id !== tempId);
          return next;
        });
      } else {
        setVagas((prev) => {
          let next = prev.map((v) => (v.id === res.origem.id ? res.origem : v));
          if (tempId) next = next.filter((v) => v.id !== tempId);
          return next.concat(res.nova);
        });
      }
    } catch (error) {
      console.error("Erro ao desmembrar vaga:", error);
      carregarVagas();
    }
  };

  const handleSalvarVaga = async (payload: NovaVagaPayload) => {
    if (modoModal === "editar" && vagaSelecionada) {
      await api.updateVaga(vagaSelecionada.id, payload);
    } else {
      const existente = vagas.find((v) => v.status === "Em Aberto" && v.cargoId === Number(payload.cargoId) && v.gestor === payload.gestor && v.departamento === payload.departamento && v.unidade === payload.unidade);
      if (existente) {
        await api.updateVaga(existente.id, { ...payload, quantidade: existente.quantidade + Number(payload.quantidade) });
      } else {
        await api.createVaga(payload);
      }
    }
    await carregarVagas();
    setModalAberta(false);
  };

  return (
    <AppShell header={{ height: 60 }} navbar={{ width: 220, breakpoint: "sm", collapsed: { mobile: !sidebarOpened } }} padding="md">
      <AppShell.Header withBorder>
        <AppHeader busca={busca} onBuscaChange={setBusca} onNovaVaga={handleAbrirCriar} opened={sidebarOpened} onToggle={() => setSidebarOpened((o) => !o)} />
      </AppShell.Header>
      <AppShell.Navbar p="xs" withBorder>
        <AppSidebar />
      </AppShell.Navbar>
      <AppShell.Main>
        <Stack gap="md">
          <Group justify="space-between"><Title order={3}>Controle de Vagas</Title><Text size="xs" c="dimmed">Gestão de recrutamento & seleção</Text></Group>
          <MetricasBar vagas={vagas} />
          <Group justify="space-between" wrap="wrap">
            <SegmentedControl value={visao} onChange={(v) => setVisao(v as any)} data={[{ label: "Kanban", value: "kanban" }, { label: "Tabela", value: "tabela" }]} />
            <Select placeholder="Todas as Unidades" data={[{ value: "", label: "Todas as Unidades" }, ...unidades.map((u) => ({ value: u, label: u }))]} value={filtroUnidade ?? ""} onChange={(v) => setFiltroUnidade(v || null)} clearable w={220} />
          </Group>
          {visao === "kanban" ? (
            <KanbanBoard vagas={vagasFiltradas} onEditar={handleEditar} onDuplicar={handleDuplicar} onExcluir={setVagaParaExcluir} onMudarStatus={handleMudarStatus} pendingDrag={pendingDrag} />
          ) : (
            <VagasTable vagas={vagasFiltradas} onEditar={handleEditar} onExcluir={setVagaParaExcluir} />
          )}
        </Stack>

        {modalAberta && <NovaVagaModal vagaInicial={vagaSelecionada} onClose={() => setModalAberta(false)} onSubmit={handleSalvarVaga} />}
        <ConfirmarExclusaoModal vagaParaExcluir={vagaParaExcluir} setVagaParaExcluir={setVagaParaExcluir} confirmarExclusao={confirmarExclusao} />
        {pendingDrag && <MoverVagaModal vaga={pendingDrag.vaga} novoStatus={pendingDrag.novoStatus} onClose={() => setPendingDrag(null)} onMoverTodas={handleMoverTodas} onMoverParcial={handleMoverParcial} />}
      </AppShell.Main>
    </AppShell>
  );
}
