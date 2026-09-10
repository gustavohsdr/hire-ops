import React, { useEffect, useState } from "react";

import type { StatusVaga, Vaga } from "./types/vaga";

const API_URL = "http://localhost:3333/api";

const COLUNAS: StatusVaga[] = [
  "Em Aberto",
  "Em Andamento",
  "Congelado",
  "Concluído",
  "Cancelado",
];

// Vagas iniciais fictícias para visualização imediata se o backend estiver desligado
const VAGAS_MOCK: Vaga[] = [
  {
    id: 1,
    cargoId: 1,
    cargo: { id: 1, nome: "Analista de Qualidade" },
    nivel: "Pleno",
    quantidade: 1,
    unidade: "Matriz SP",
    departamento: "Qualidade",
    gestor: "Carlos Eduardo",
    recrutador: "Elane Araújo",
    motivo: "Aumento de Quadro",
    tipoContrato: "CLT",
    status: "Em Aberto",
    slaDias: 30,
    dataAbertura: new Date().toISOString(),
  },
  {
    id: 2,
    cargoId: 2,
    cargo: { id: 2, nome: "Desenvolvedor Fullstack" },
    nivel: "Sênior",
    quantidade: 2,
    unidade: "Remoto",
    departamento: "T.I.",
    gestor: "Ana Paula",
    recrutador: "Elane Araújo",
    motivo: "Substituição",
    tipoContrato: "PJ",
    status: "Em Andamento",
    slaDias: 15,
    dataAbertura: new Date().toISOString(),
  },
];

export function App() {
  const [vagas, setVagas] = useState<Vaga[]>(VAGAS_MOCK);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalAberto, setModalAberto] = useState<boolean>(false);

  // Form State
  const [cargoNome, setCargoNome] = useState("");
  const [nivel, setNivel] = useState<"Jr" | "Pleno" | "Sr">("Pleno");
  const [unidade, setUnidade] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [gestor, setGestor] = useState("");
  const [recrutador, setRecrutador] = useState("");

  // 1. Carregar vagas da API
  const carregarVagas = async () => {
    try {
      const res = await fetch(`${API_URL}/vagas`);
      if (res.ok) {
        const data = await res.json();
        setVagas(data);
      }
    } catch (err) {
      console.warn(
        "Backend offline. Exibindo vagas fictícias para teste visual.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarVagas();
  }, []);

  // 2. Mudar status do Card (Mover no Kanban)
  const moverStatus = async (id: number, novoStatus: StatusVaga) => {
    // Atualização otimista na tela
    setVagas((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: novoStatus } : v)),
    );

    try {
      await fetch(`${API_URL}/vagas/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novoStatus }),
      });
    } catch (err) {
      console.error("Erro ao atualizar status na API", err);
    }
  };

  // 3. Criar nova vaga via Modal
  const handleCriarVaga = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cargoNome || !unidade) return;

    const novaVagaLocal: Vaga = {
      id: Date.now(),
      cargoId: 99,
      cargo: { id: 99, nome: cargoNome },
      nivel,
      quantidade: 1,
      unidade,
      departamento: departamento || "Geral",
      gestor: gestor || "A definir",
      recrutador: recrutador || "Elane",
      motivo: "Aumento de Quadro",
      tipoContrato: "CLT",
      status: "Em Aberto",
      slaDias: 30,
      dataAbertura: new Date().toISOString(),
    };

    setVagas((prev) => [novaVagaLocal, ...prev]);
    setModalAberto(false);
    setCargoNome("");
    setUnidade("");

    try {
      // Cria o cargo primeiro se necessário e depois a vaga na API
      const resCargo = await fetch(`${API_URL}/cargos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: cargoNome }),
      });
      const cargoCriado = await resCargo.json();

      await fetch(`${API_URL}/vagas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cargoId: cargoCriado.id,
          nivel,
          quantidade: 1,
          unidade,
          departamento: departamento || "Geral",
          gestor: gestor || "A definir",
          recrutador: recrutador || "Elane",
          motivo: "Aumento de Quadro",
          tipoContrato: "CLT",
          slaDias: 30,
        }),
      });
      carregarVagas();
    } catch (err) {
      console.warn("Vaga salva apenas no estado local (API offline).");
    }
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.logoGroup}>
          <div style={styles.logoBadge}>RF</div>
          <h1 style={styles.title}>RecruitFlow</h1>
        </div>
        <button style={styles.btnPrimary} onClick={() => setModalAberto(true)}>
          + Nova Vaga
        </button>
      </header>

      {/* METRICAS RAPIDAS */}
      <div style={styles.metricsContainer}>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Total de Vagas</span>
          <span style={styles.metricValue}>{vagas.length}</span>
        </div>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Em Andamento</span>
          <span style={{ ...styles.metricValue, color: "#2563eb" }}>
            {vagas.filter((v) => v.status === "Em Andamento").length}
          </span>
        </div>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Concluídas</span>
          <span style={{ ...styles.metricValue, color: "#16a34a" }}>
            {vagas.filter((v) => v.status === "Concluído").length}
          </span>
        </div>
      </div>

      {/* QUADRO KANBAN */}
      <div style={styles.kanbanBoard}>
        {COLUNAS.map((colunaStatus) => {
          const vagasColuna = vagas.filter((v) => v.status === colunaStatus);
          return (
            <div key={colunaStatus} style={styles.kanbanColumn}>
              <div style={styles.columnHeader}>
                <span style={styles.columnTitle}>{colunaStatus}</span>
                <span style={styles.columnCount}>{vagasColuna.length}</span>
              </div>

              <div style={styles.columnList}>
                {vagasColuna.map((vaga) => (
                  <div key={vaga.id} style={styles.vagaCard}>
                    <div style={styles.cardHeader}>
                      <span style={styles.cardTitle}>
                        {vaga.cargo?.nome} ({vaga.nivel})
                      </span>
                    </div>

                    <div style={styles.cardMeta}>
                      <p>📍 {vaga.unidade}</p>
                      <p>👤 Gestor: {vaga.gestor}</p>
                      <p>⏱️ SLA: {vaga.slaDias} dias</p>
                    </div>

                    {/* Ações de mudança rápida de status */}
                    <div style={styles.cardActions}>
                      <select
                        value={vaga.status}
                        onChange={(e) =>
                          moverStatus(vaga.id, e.target.value as StatusVaga)
                        }
                        style={styles.statusSelect}
                      >
                        {COLUNAS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DE NOVA VAGA */}
      {modalAberto && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>Criar Nova Requisição de Vaga</h3>
            <form onSubmit={handleCriarVaga} style={styles.form}>
              <label style={styles.label}>
                Cargo / Função:
                <input
                  type="text"
                  placeholder="Ex: Analista Fiscal"
                  value={cargoNome}
                  onChange={(e) => setCargoNome(e.target.value)}
                  style={styles.input}
                  required
                />
              </label>

              <label style={styles.label}>
                Nível / Senioridade:
                <select
                  value={nivel}
                  onChange={(e) => setNivel(e.target.value as any)}
                  style={styles.input}
                >
                  <option value="Jr">Júnior</option>
                  <option value="Pleno">Pleno</option>
                  <option value="Sr">Sênior</option>
                </select>
              </label>

              <label style={styles.label}>
                Unidade / Filial:
                <input
                  type="text"
                  placeholder="Ex: Matriz SP ou Fábrica MG"
                  value={unidade}
                  onChange={(e) => setUnidade(e.target.value)}
                  style={styles.input}
                  required
                />
              </label>

              <label style={styles.label}>
                Gestor Solicitante:
                <input
                  type="text"
                  placeholder="Ex: Carlos Silva"
                  value={gestor}
                  onChange={(e) => setGestor(e.target.value)}
                  style={styles.input}
                />
              </label>

              <div style={styles.modalButtons}>
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  style={styles.btnSecondary}
                >
                  Cancelar
                </button>
                <button type="submit" style={styles.btnPrimary}>
                  Salvar Vaga
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ESTILOS INLINE (CSS em JS limpo e autocontido)
const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
    padding: "24px",
    color: "#0f172a",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  logoGroup: { display: "flex", alignItems: "center", gap: "12px" },
  logoBadge: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontWeight: "bold",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "18px",
  },
  title: { margin: 0, fontSize: "24px", fontWeight: 700 },
  btnPrimary: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    padding: "10px 18px",
    fontWeight: 600,
    cursor: "pointer",
  },
  btnSecondary: {
    backgroundColor: "#e2e8f0",
    color: "#334155",
    border: "none",
    borderRadius: "6px",
    padding: "10px 18px",
    fontWeight: 600,
    cursor: "pointer",
  },
  metricsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    marginBottom: "24px",
  },
  metricCard: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "16px",
    border: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
  },
  metricLabel: { fontSize: "13px", color: "#64748b" },
  metricValue: { fontSize: "24px", fontWeight: "bold", marginTop: "4px" },
  kanbanBoard: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "16px",
    alignItems: "start",
  },
  kanbanColumn: {
    backgroundColor: "#f1f5f9",
    borderRadius: "8px",
    padding: "12px",
    minHeight: "500px",
  },
  columnHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    paddingBottom: "8px",
    borderBottom: "2px solid #cbd5e1",
  },
  columnTitle: { fontWeight: 600, fontSize: "14px", color: "#334155" },
  columnCount: {
    backgroundColor: "#cbd5e1",
    borderRadius: "12px",
    padding: "2px 8px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  columnList: { display: "flex", flexDirection: "column", gap: "12px" },
  vagaCard: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  cardHeader: { marginBottom: "8px" },
  cardTitle: { fontWeight: 600, fontSize: "14px", color: "#0f172a" },
  cardMeta: { fontSize: "12px", color: "#64748b", lineHeight: "1.4" },
  cardActions: {
    marginTop: "10px",
    paddingTop: "8px",
    borderTop: "1px solid #f1f5f9",
  },
  statusSelect: {
    width: "100%",
    padding: "4px 8px",
    fontSize: "12px",
    borderRadius: "4px",
    borderColor: "#cbd5e1",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "24px",
    width: "400px",
    maxWidth: "90%",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "16px",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    fontSize: "13px",
    fontWeight: 500,
    gap: "4px",
  },
  input: {
    padding: "8px 12px",
    borderRadius: "4px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
  },
  modalButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    marginTop: "16px",
  },
};
