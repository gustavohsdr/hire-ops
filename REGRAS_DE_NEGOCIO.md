# Regras de Negócio - Kanban de Vagas

## 1. Processos vs. Headcount
- Card = 1 `Vaga`; `quantidade` = headcount (int, default 1). Badge `QTD: N` só se `>1` (`VagaCard.tsx`).

## 2. Métricas (por headcount)
- `ativas = vagas.filter(s => s ≠ Concluído && s ≠ Cancelado)`
- `processosAtivos = sum(ativas.quantidade)` → card "Processos Ativos"
- `dentroSlaQtd = sum(ativas com diasRestantes>=0 por quantidade)` → `pct = round(dentro/total*100)` → "Dentro do SLA `pct%` (`dentro/total` posições)"
- `fechadasMes = sum(Concluído no mês por quantidade)`
- Métricas contam vagas/posições, não cards. Ex: card(2)+card(1)=3/3 no SLA.

## 3. Agrupamento Automático
- Chave: `cargoId + gestor + departamento + unidade` (ignora id/quantidade). `isMesmoNegocio` em `App.tsx` e `vagasController.ts`.
- **Criação:** verifica `Em Aberto` mesma chave → `update quantidade += nova`; senão `create`.
- **Mover status (PATCH /vagas/:id/status):** busca alvo no destino; se existir → `update alvo += origem` + `delete origem` (agrupado); senão `update status`.

## 4. Movimentação Parcial
- Se `quantidade>1`, drop guarda `pendingDrag={vaga,novoStatus}` sem `setVagas` (sem bounce) e abre `MoverVagaModal` (radio cards, 580px, `Radio.Group`, seletor híbrido +/- e input).
- **Todas:** `executarMoverTodas` com agrupamento.
- **Parcial N:** `POST /vagas/:id/desmembrar` {quantidade:N, novoStatus}. Valida `1<=N<origem.quantidade`. Se alvo existe → `origem-=N`, `alvo+=N`; senão cria nova vaga `N` no destino. Ghost `pendingId` no destino, confirmação remove ghost.

## 5. Layout
- `AppShell` com `AppHeader` (RH App, busca, Nova Vaga, avatar) + `AppSidebar` (Controle de Vagas ativo, Indicadores, Configurações).
- Controle superior: `SegmentedControl` Kanban/Tabela + `Select` Todas as Unidades.
- Kanban: `ScrollArea` horizontal overlay + colunas `300px` + `ScrollArea` vertical interno (`calc(100vh-300px)`).

## 6. Integração API
Base `http://localhost:3333/api` (`services/api.ts` ↔ `backend/src/routes.ts`)

| Método | Rota | Função | Retorno |
|--------|------|--------|---------|
| GET | /vagas | getVagas | Vaga[] |
| POST | /vagas | createVaga | Vaga (agrupado se já existe) |
| PUT | /vagas/:id | updateVaga | Vaga |
| DELETE | /vagas/:id | deleteVaga | 204 |
| PATCH | /vagas/:id/status | updateStatus | AtualizarStatusResponse |
| POST | /vagas/:id/desmembrar | desmembrarVaga | DesmembrarResponse |
| GET/POST | /cargos | getCargos/createCargo | Cargo/Cargo[] |

Tipos `types/vaga.ts`: `StatusVaga`, `Vaga`, `NovaVagaPayload`, `AtualizarStatusResponse`, `DesmembrarResponse` (discriminated union por `agrupado`).
