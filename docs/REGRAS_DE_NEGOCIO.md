# Regras de Negócio - Kanban de Vagas

## 1. Processos vs. Headcount
- Card = 1 `Vaga`; `quantidade` = headcount (int, default 1). Badge `QTD: N` só se `>1` (`VagaCard.tsx`).
- Métricas contam vagas/posições, não cards. Ex: card(2)+card(1)=3/3 no SLA.

## 2. Métricas (por headcount)
- `ativas = vagas.filter(s => s ≠ Concluído && s ≠ Cancelado)`
- `processosAtivos = sum(ativas.quantidade)` → "Processos Ativos"
- `dentroSlaQtd = sum(ativas com diasRestantes>=0 por quantidade)` → `pct = round(dentro/total*100)` → "Dentro do SLA `pct%` (`dentro/total` no prazo)"
- `fechadasMes = sum(Concluído no mês por quantidade)`
- `MetricasBar.tsx`: 3 `Paper` `p=md` `minHeight 88` com header `Group h20` baseline alinhado, valor `Text xl fw700 lh1`. Recomposição harmonizada com Kanban sem cortes de viewport.

## 3. Agrupamento Automático
- Chave: `cargoId + nivel + gestor + departamento + unidade + tipoContrato + dataAbertura (YYYY-MM-DD)` via `isMesmoNegocio` (`App.tsx`) e `findFirst` dia (`vagasController.ts:criar/atualizarStatus/desmembrar` com `dataAbertura {gte:inicioDia, lt:fimDia}` + `mesmoDia`). Ignora `id/quantidade`.
- Vagas em dias/ciclos diferentes NÃO agrupam (preserva SLA). `nivel`/`tipoContrato` diferentes também não agrupam.
- **Criação POST /vagas:** busca `Em Aberto` mesma chave mesmo dia; se existe → `update quantidade += nova` retorna `{agrupado:true, vaga}` (200); senão `create`. Duplicação e criação idêntica no mesmo dia agrupam imediato.
- **Mover PATCH /vagas/:id/status:** busca alvo no destino mesma chave+dia+nivel+tipoContrato; se existe e mesmo dia → `update alvo+=origem + delete origem` (`{agrupado:true, destino, removidoId}`); senão `update status`.

## 4. Movimentação Parcial
- Se `quantidade>1`, drop guarda `pendingDrag={vaga,novoStatus}` sem `setVagas` (sem bounce) e abre `MoverVagaModal`.
- **MoverVagaModal** (`radius md, padding lg, centered`): pergunta `"Como você deseja mover este processo?"`, `Radio.Group` em `Paper` borda seletiva, opção `"Mover todas as {total} vagas"` (sem subtítulo) e `"Mover apenas {qtd} vaga(s)"`/`"Mover apenas parte das vagas"` com `NumberInput` e texto `"{qtd} vai para {destino} ({resto} fica em {origem})"`, botões `Cancelar` / `Confirmar`.
- **Todas:** `executarMoverTodas` com agrupamento atômico.
- **Parcial N:** `POST /vagas/:id/desmembrar` valida `1<=N<origem.quantidade`. Se alvo mesmo dia/nivel/tipoContrato existe → `origem-=N`, `alvo+=N`; senão cria nova vaga `N` no destino. Ghost `pendingId` no destino.

## 5. Layout Viewport Fixo
- `App.tsx`: `AppShell` `height 100vh maxHeight 100vh overflow hidden display flex flexDirection column`; `AppShell.Main` `flex1 display flex flexDirection column overflow hidden minHeight 0`; sem scroll global.
- Controle superior: `SegmentedControl` Kanban/Tabela + `Select` Todas as Unidades.
- `KanbanBoard.tsx`: `Box flex1 display flex gap md overflowX auto overflowY hidden minHeight 0` + inner `Box` `flexWrap nowrap`; scroll horizontal no board.
- `KanbanColumn.tsx`: `Paper display flex flexDirection column height 100% maxHeight 100% minHeight 0`; `ScrollArea type="hover"` vertical independente por coluna; Droppable `flex1 overflowY auto paddingRight 4px minHeight 0`; header fixo + `Stack gap xs` de cards.
- `MetricasBar` permanece no viewport fixo acima do Kanban, sem cortes.
- `NovaVagaModal.tsx`: `size lg padding md` sem `Stepper`, `Grid` 2 col + `SimpleGrid` 2/3 cols tela única sem scroll, cargo só via Configurações.
- `ConfiguracoesPage.tsx`: `Tabs` Cargos/Unidades/Gestores.

## 6. Indicadores Visuais de SLA (VagaCard)
- `diasDecorridos=floor((dataFim-dataAbertura)/86400000)` `dataFim=dataFinalizacao??now()`; `diasRestantes=slaDias-diasDecorridos`; `isFinalizada=status===Concluído||Cancelado`.
- `VENCIDO` (`diasRestantes<0` e `!isFinalizada`): `borderLeft 4px red-6`, `Badge red IconAlertTriangle` `"ATRASADO HÁ X DIAS"` com `Tooltip`.
- `ATENÇÃO` (`0<=diasRestantes<=5`): `borderLeft 4px yellow-6`, `Badge yellow` `"RESTAM: X DIAS"`.
- `OK` (`>5`): `borderLeft 1px gray-3`, `Badge gray`.
- `Concluído/Cancelado`: `NEUTRO` borda neutra (`"FECHADO EM X D"` / `"CANCELADO"`).

## 7. Parâmetros Base (Configurações)
- `schema.prisma`:
  - `Cargo` (id uuid, nome unique, categoria ADMINISTRATIVO|OPERACIONAL, departamento String?, centroDeCusto String?, slaPadrao 30, cargaHoraria String?, salarioEstagio/Junior/Pleno/Senior/Coordenador Float?, createdAt)
  - `Unidade` (id uuid, nome unique)
  - `Gestor` (id uuid, nome unique)
  - `Vaga.cargoId String` FK uuid, `salario Float?`, `cargaHoraria String?`, `centroDeCusto String?`
- `parametrosController.ts`: `cargosController` (listar/criar/atualizar/remover), `unidadesController`/`gestoresController` (listar/criar/remover).
- `ConfiguracoesPage.tsx` (`Tabs` Mantine): Aba Cargos (tabela badge categoria `blue`/`orange` em `Tooltip`, SLA, `CargoModal`), Aba Unidades (lista+CRUD), Aba Gestores (lista+CRUD).
- `CargoModal.tsx` (`size lg padding md`): `TextInput` Nome, `SimpleGrid cols2` Categoria+Departamento, `SimpleGrid cols2` SLA Padrão+Carga Horária, `TextInput` Centro de Custo (`CC-1020 - RH`), `SimpleGrid cols2` (Bolsa Estágio|Salário Júnior / Pleno|Sênior) + linha `Salário Coordenador`, rótulos por extenso, proteção com máscara olhinho.
- `NovaVagaModal.tsx` alimentado estritamente por `api.getCargos/getUnidades/getGestores` (sem botão `+ Cadastrar novo cargo`).

## 8. Herança Automática Cargo → Vaga
- Selecionar `Cargo` em `NovaVagaModal`: `aplicarHerancaCargo` localiza `cargo` em `cargos[]` e preenche `categoria=cargo.categoria`, `departamento=cargo.departamento` (se existir), `centroDeCusto=cargo.centroDeCusto` (se existir), `slaDias=cargo.slaPadrao`, `cargaHoraria=cargo.cargaHoraria` (se existir) e salário do nível atual via `aplicarSalario`.
- Alternar `Nível` (`Estágio/Jr/Pleno/Senior/Coordenador`): `SegmentedControl` onChange chama `aplicarSalario(cargoId, nivel)` mapeando `salarioEstagio/Junior/Pleno/Senior/Coordenador` → `salario` (editável manualmente).
- `Vaga.salario` e `Vaga.centroDeCusto` persistem opcionais; `categoria` herdada exibida via `vaga.cargo.categoria`.

## 9. Proteção de Dados Sensíveis
- `CargoModal.tsx`: campos de remuneração (`Bolsa Estágio`, `Salário Júnior/Pleno/Sênior/Coordenador`) com máscara `WebkitTextSecurity: disc` quando `showSalarios=false` (inicial oculto).
- Botão alternância `ActionIcon` `IconEye`/`IconEyeOff` (`rightSection={eyeButton}`) em cada `NumberInput` de salário; `showSalarios` controla `styles.maskedStyles`.
- `NovaVagaModal.tsx`: `salario` editável mas autopreenchido por nível, sem máscara (dado operacional da vaga).

## 10. Diretrizes de UI/UX do Kanban
- **Badges de Categoria dinâmicas:** `VagaCard.tsx` `categoriaTexto = vaga.cargo?.categoria || vaga.categoria || 'ADMINISTRATIVO'` + `categoriaCor = categoriaTexto==='OPERACIONAL' ? 'orange' : 'blue'`; `ConfiguracoesPage.tsx` mesmo mapeamento. Render:
  ```tsx
  <Tooltip label={categoriaTexto} position="top" radius="sm" withArrow={false}>
    <Badge color={categoriaCor} size="xs" variant="light">{categoriaTexto}</Badge>
  </Tooltip>
  ```
  ADMINISTRATIVO=`blue` light, OPERACIONAL=`orange` light.
- **Tooltips delicados:** Mantine `Tooltip` (`withArrow={false}`, `position="top"`, `radius="sm"`) sem atributo `title` nativo duplicado; disparo condicional exclusivo para truncamento: `disabled={(cargo.nome.length < 32)}` no título do card e `disabled={textoSlaCompleto.length < 18}` no SLA; categoria sempre com Tooltip mas discreto.
- **Rodapé VagaCard:** `Group gap4` aproximado (`IconUser`/`IconMapPin` 14px + `gap4`) sem separador visual ruidoso `•`; gestor/unidade com `whiteSpace nowrap ellipsis`, `QTD` badge à direita apenas se `quantidade>1`.
- **VagaCard compacto:** `Card padding xs (8px)`, linha1 categoria+SLA+kebab `Menu.Sub` (Mover Status), linha2 cargo-nível `fw600 fz13` truncado com Tooltip, linha3 rodapé.

## 11. Integração API
Base `http://localhost:3333/api` (`services/api.ts` ↔ `backend/src/routes.ts`)

| Método | Rota | Função | Retorno |
|--------|------|--------|---------|
| GET | /vagas | getVagas | Vaga[] (`include: { cargo: true }`) |
| POST | /vagas | createVaga | `{agrupado:true,vaga}` ou Vaga |
| PUT | /vagas/:id | updateVaga | Vaga |
| DELETE | /vagas/:id | deleteVaga | 204 |
| PATCH | /vagas/:id/status | updateStatus | AtualizarStatusResponse |
| POST | /vagas/:id/desmembrar | desmembrarVaga | DesmembrarResponse |
| GET/POST/PUT/DELETE | /cargos | getCargos/createCargo/updateCargo/deleteCargo | Cargo/Cargo[] |
| GET/POST/DELETE | /unidades | getUnidades/createUnidade/deleteUnidade | Unidade/Unidade[] |
| GET/POST/DELETE | /gestores | getGestores/createGestor/deleteGestor | Gestor/Gestor[] |

Tipos `types/vaga.ts`: `StatusVaga`, `Vaga` (cargoId string uuid, cargo: Cargo, salario?, centroDeCusto?), `Cargo` (id uuid, categoria, departamento?, centroDeCusto?, slaPadrao, cargaHoraria?, 5 salarios), `Unidade`, `Gestor`, `NovaVagaPayload`, `AtualizarStatusResponse`, `DesmembrarResponse`.
Backend `vagasController.listar` garante `prisma.vaga.findMany({ include: { cargo: true } })` para herança de categoria.
