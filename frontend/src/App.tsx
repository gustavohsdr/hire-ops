import { Button, Center, Container, Group, Loader, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import { KanbanBoard } from "./components/Kanban/KanbanBoard";
import { NovaVagaModal } from "./components/Modals/NovaVagaModal";
import { api } from "./services/api";
import type { NovaVagaPayload, StatusVaga, Vaga } from "./types/vaga";

export function App() {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const carregarVagas = async () => {
    try {
      setLoading(true);
      const data = await api.getVagas();
      setVagas(data);
    } catch (error) {
      console.error("Erro ao carregar vagas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarVagas();
  }, []);

  const handleCriarVaga = async (payload: NovaVagaPayload) => {
    try {
      await api.createVaga(payload);
      await carregarVagas();
      setIsModalOpen(false);
    } catch (error) {
      alert("Erro ao criar vaga");
    }
  };

  const handleMudarStatus = async (id: number, novoStatus: StatusVaga) => {
    const estadoAnterior = [...vagas];

    setVagas((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: novoStatus } : v)),
    );

    try {
      await api.updateStatus(id, novoStatus);
    } catch (error) {
      alert("Erro ao salvar alteração. Revertendo status...");
      setVagas(estadoAnterior);
    }
  };

  return (
    <Container size="xl" py="lg">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Controle de Vagas R&S</Title>
        <Button onClick={() => setIsModalOpen(true)}>+ Nova Vaga</Button>
      </Group>

      {loading ? (
        <Center h={400}>
          <Loader size="lg" />
        </Center>
      ) : (
        <KanbanBoard vagas={vagas} onMudarStatus={handleMudarStatus} />
      )}

      {isModalOpen && (
        <NovaVagaModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCriarVaga}
        />
      )}
    </Container>
  );
}
