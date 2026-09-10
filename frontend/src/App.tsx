import { Button, Container, Group, Stack, Text, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { KanbanBoard } from "./components/Kanban/KanbanBoard";
import { MetricasBar } from "./components/MetricasBar";
import { ConfirmarExclusaoModal } from "./components/Modals/ConfirmarExclusaoModal";
import { MoverVagaModal } from "./components/Modals/MoverVagaModal";
import { NovaVagaModal } from "./components/Modals/NovaVagaModal";
import { api } from "./services/api";
import type { NovaVagaPayload, StatusVaga, Vaga } from "./types/vaga";

export function App() {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [modalAberta, setModalAberta] = useState(false);
  const [vagaSelecionada, setVagaSelecionada] = useState<Vaga | null>(null);
  const [modoModal, setModoModal] = useState<"criar" | "editar" | "duplicar">(
    "criar",
  );
  const [vagaParaExcluir, setVagaParaExcluir] = useState<Vaga | null>(null);
  const [pendingDrag, setPendingDrag] = useState<{ vaga: Vaga; novoStatus: StatusVaga } | null>(null);

  const carregarVagas = async () => {
    const dados = await api.getVagas();
    setVagas(dados);
  };

  useEffect(() => {
    carregarVagas();
  }, []);

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

  const isMesmoNegocio = (a: Vaga, b: Vaga) =>
    a.cargoId === b.cargoId && a.gestor === b.gestor && a.departamento === b.departamento && a.unidade === b.unidade;

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
      if (res.agrupado && res.destino) {
        setVagas((prev) => {
          let next = prev.filter((v) => v.id !== res.removidoId);
          return next.map((v) => (v.id === res.destino!.id ? res.destino! : v));
        });
      } else if (res.vaga) {
        setVagas((prev) => prev.map((v) => (v.id === res.vaga!.id ? res.vaga! : v)));
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
      if (res.agrupado && res.destino) {
        setVagas((prev) => {
          let next = prev.map((v) => (v.id === res.origem.id ? res.origem : v.id === res.destino!.id ? res.destino! : v));
          if (tempId) next = next.filter((v) => v.id !== tempId);
          return next;
        });
      } else if (res.nova) {
        setVagas((prev) => {
          let next = prev.map((v) => (v.id === res.origem.id ? res.origem : v));
          if (tempId) next = next.filter((v) => v.id !== tempId);
          return next.concat(res.nova!);
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
      const existente = vagas.find(
        (v) =>
          v.status === "Em Aberto" &&
          v.cargoId === Number(payload.cargoId) &&
          v.gestor === payload.gestor &&
          v.departamento === payload.departamento &&
          v.unidade === payload.unidade,
      );
      if (existente) {
        await api.updateVaga(existente.id, {
          ...payload,
          quantidade: existente.quantidade + Number(payload.quantidade),
        });
      } else {
        await api.createVaga(payload);
      }
    }
    await carregarVagas();
    setModalAberta(false);
  };

  return (
    <Container size="xl" py="lg">
      <Stack gap="lg">
        {/* CABEÇALHO PRINCIPAL DA APLICAÇÃO */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={2} c="dark.8">
              Controle de Vagas
            </Title>
            <Text size="xs" c="dimmed">
              Gestão e acompanhamento de recrutamento & seleção
            </Text>
          </div>

          <Button
            leftSection={<IconPlus size={16} />}
            onClick={handleAbrirCriar}
            radius="md"
          >
            Nova Requisição
          </Button>
        </Group>

        <MetricasBar vagas={vagas} />

        {/* CONTAINER DO KANBAN */}
        <KanbanBoard
          vagas={vagas}
          onEditar={handleEditar}
          onDuplicar={handleDuplicar}
          onExcluir={setVagaParaExcluir}
          onMudarStatus={handleMudarStatus}
        />
      </Stack>

      {/* MODAL */}
      {modalAberta && (
        <NovaVagaModal
          vagaInicial={vagaSelecionada}
          onClose={() => setModalAberta(false)}
          onSubmit={handleSalvarVaga}
        />
      )}

      <ConfirmarExclusaoModal
        vagaParaExcluir={vagaParaExcluir}
        setVagaParaExcluir={setVagaParaExcluir}
        confirmarExclusao={confirmarExclusao}
      />

      {pendingDrag && (
        <MoverVagaModal
          vaga={pendingDrag.vaga}
          novoStatus={pendingDrag.novoStatus}
          onClose={() => setPendingDrag(null)}
          onMoverTodas={handleMoverTodas}
          onMoverParcial={handleMoverParcial}
        />
      )}
    </Container>
  );
}
