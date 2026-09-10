# Regras de Negócio - Kanban de Vagas

## 1. Processos vs. Vagas (Headcount)
- Cada card = 1 processo (`Vaga.id`). O campo `Vaga.quantidade` (int, default 1, `schema.prisma:21`) representa o número de cadeiras/headcount daquele processo.
- **Visual:** Tag `QTD: N` só é renderizada quando `vaga.quantidade > 1` (`VagaCard.tsx:91`). Se `quantidade = 1`, nenhum badge é exibido para evitar poluição.

## 2. Barra de Métricas
- Componente `MetricasBar` (`frontend/src/components/MetricasBar.tsx`) no topo do Kanban.
- `totalProcessos = vagas.length`
- `totalVagas = vagas.reduce((acc, v) => acc + v.quantidade, 0)`
- Exibição: `"{totalProcessos} Processos Ativos"` e, **condicionalmente**, `" ({totalVagas} vagas no total)"` apenas quando `totalVagas > totalProcessos` (há ao menos um card com quantidade > 1).
- Padrão minimalista: coluna exibe apenas `"{status} ({vagas.length})"` (`KanbanColumn.tsx`).

## 3. Agrupamento Automático
- **Chave de negócio:** dois cards são considerados idênticos se `cargoId === cargoId && gestor === gestor && departamento === departamento && unidade === unidade` (ignora `id` e `quantidade`). Implementado em `App.tsx:isMesmoNegocio` e `backend/src/controllers/vagasController.ts:criar/atualizarStatus/desmembrar`.
- **Na Criação:** Antes de `POST /vagas`, `App.tsx:handleSalvarVaga` e `vagasController.criar` verificam se já existe vaga em `Em Aberto` com mesma chave. Se existir, fazem `PUT /vagas/:id` somando `quantidade_atual + nova_quantidade` ao invés de criar novo registro.
- **No Drag & Drop / Mover Status:** Ao mover para `novoStatus`, `vagasController.atualizarStatus` busca `findFirst` no destino com mesma chave. Se encontrar `alvo`, executa transação: `update alvo.quantidade += origem.quantidade` + `delete origem`, retornando `{ agrupado: true, destino, removidoId }`. Se não encontrar, faz `update status` normal. No frontend, `executarMoverTodas` faz o mesmo otimisticamente antes da reconciliação com a API.

## 4. Movimentação Parcial (Fracionamento)
- Quando `vaga.quantidade > 1`, mover não é imediato: `App.tsx:handleMudarStatus` armazena intenção em `pendingDrag = { vaga, novoStatus }` e abre `MoverVagaModal` (`frontend/src/components/Modals/MoverVagaModal.tsx`) com pergunta "Deseja mover todas as X vagas ou apenas algumas?".
- **Mover Todas:** chama `executarMoverTodas` (agrupamento incluso).
- **Mover Parcial (N):** `POST /vagas/:id/desmembrar` (`vagasController.desmembrar`) valida `1 <= N < quantidade_origem`. Se houver `alvo` idêntico no destino, agrupa: `origem.quantidade -= N` e `alvo.quantidade += N`. Se não houver alvo, cria nova vaga com `quantidade = N` e `status = novoStatus`.
- **Execução Atômica / Anti-flicker:** `App.tsx:pendingDrag` garante que **nenhum `setVagas` ocorre no `onDragEnd`**. O card permanece estático enquanto o modal está aberto. Só em `handleMoverTodas`/`handleMoverParcial` ocorre **uma única operação atômica** de `setVagas` (atualizando origem e destino/removendo/criando), seguida de reconciliação com a resposta da API e `carregarVagas()` em caso de erro. Isso elimina o efeito "vai e volta" do DND.

## 5. Integração com API
Base: `http://localhost:3333/api` (`frontend/src/services/api.ts`, `backend/src/routes.ts`)

| Método | Rota | Função `api.ts` | Descrição |
|--------|------|-----------------|-----------|
| GET | `/vagas` | `getVagas()` | Lista todas as vagas com `cargo` |
| POST | `/vagas` | `createVaga(payload)` | Cria vaga (com agrupamento) |
| PUT | `/vagas/:id` | `updateVaga(id, payload)` | Atualiza dados da vaga |
| DELETE | `/vagas/:id` | `deleteVaga(id)` | Remove vaga |
| PATCH | `/vagas/:id/status` | `updateStatus(id, novoStatus)` | Move status (com agrupamento), retorna `{agrupado, vaga|destino}` |
| POST | `/vagas/:id/desmembrar` | `desmembrarVaga(id, quantidade, novoStatus)` | Fraciona vaga, retorna `{origem, nova|destino, agrupado}` |
| GET | `/cargos` | `getCargos()` | Lista cargos |
| POST | `/cargos` | `createCargo(nome)` | Cria cargo |

Tipos: `Vaga`, `Cargo`, `NovaVagaPayload`, `StatusVaga = "Em Aberto" | "Em Andamento" | "Congelado" | "Concluído" | "Cancelado"` (`frontend/src/types/vaga.ts`).
