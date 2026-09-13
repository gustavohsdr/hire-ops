# Roadmap - Kanban de Vagas

## Concluído e Validado
- [x] Kanban 5 colunas (Em Aberto → Cancelado) + drag & drop com agrupamento/fracionamento atômico
- [x] Chave de agrupamento `cargoId+nivel+gestor+departamento+unidade+tipoContrato+dataAbertura(YYYY-MM-DD)` + ciclo SLA (dias diferentes não agrupam)
- [x] Criação/duplicação agrupamento imediato `{agrupado:true,vaga}` mesmo dia; `niveis/tipos` diferentes mantém cards separados
- [x] MoverVagaModal redesign `radius md` + `Radio.Group Paper` + pergunta direta + `Confirmar` + validação `desmembrar`
- [x] Fluxo atômico `pendingDrag` sem bounce + reconciliação API + ghost `pendingId`
- [x] NovaVagaModal compacto tela única `size lg padding md` sem Stepper/Grid tela única, `Cargo *` só via Configurações, selects Gestor/Unidade de `parametros`, herança Cargo→Vaga (departamento/centroDeCusto/SLA/cargaHoraria/salário por nível editável) + campo `Centro de Custo` (`CC-1020 - RH`)
- [x] CargoModal `size lg` `SimpleGrid cols2` rótulos por extenso (Júnior/Sênior) + `Carga Horária` + 5 salários com olhinho `IconEye/Off` máscara + `SimpleGrid cols2` Categoria+Departamento / SLA+Carga Horária + `Centro de Custo`
- [x] Módulo de Configurações/Parâmetros (Cargos, Unidades, Gestores) — `schema.prisma` Cargo(uuid, categoria, departamento?, centroDeCusto?, slaPadrao, cargaHoraria?, 5 salários), Unidade(uuid), Gestor(uuid), Vaga(cargoId string uuid, salario?, centroDeCusto?), rotas `parametrosController` (Cargos/Unidades/Gestores), `ConfiguracoesPage` Tabs Mantine, `AppSidebar` navegação
- [x] Herança automática em tempo real dos dados do Cargo no modal de Vagas — `aplicarHerancaCargo` autopreenche categoria, departamento, centroDeCusto, SLA e cargaHorária ao selecionar Cargo; `SegmentedControl` de Nível autopreenche salário sugerido (Estágio/Júnior/Pleno/Sênior/Coordenador), editável
- [x] Layout Viewport Fixo (`100vh`) com scroll de coluna independente — `AppShell 100vh overflow hidden`, `KanbanBoard overflowX auto`, `KanbanColumn height 100%` com `ScrollArea` vertical independente, sem scroll global e sem cortes no `MetricasBar`
- [x] Badges de Categoria dinâmicas com mapeamento de cores (`blue` / `orange`) — `VagaCard categoriaTexto=vaga.cargo?.categoria||vaga.categoria||'ADMINISTRATIVO'` + `categoriaCor=OPERACIONAL?'orange':'blue'`; `ConfiguracoesPage` mesmo mapeamento; `Tooltip+Badge variant light`
- [x] Mascaramento e proteção de dados salariais (Show/Hide) no `CargoModal` — `WebkitTextSecurity disc` inicial oculto, `ActionIcon IconEye/Off` por `NumberInput` (Bolsa Estágio, Salário Júnior/Pleno/Sênior/Coordenador)
- [x] Tooltips delicados com disparo condicional para textos truncados — Mantine `Tooltip withArrow false position top radius sm` sem `title` nativo; `disabled` condicional (`cargo.nome.length < 32`, `textoSlaCompleto.length < 18`); categoria sempre em Tooltip discreto
- [x] Recomposição e harmonização visual do `MetricasBar` e `VagaCard` — `MetricasBar` 3 `Paper p md minHeight 88 Group h20 baseline xl fw700 lh1` (`dentro/total no prazo`); `VagaCard padding 8` bordas SLA, título `fw600 fz13` truncado, rodapé `gap4` sem `•`, `QTD` condicional
- [x] VagasTable + toggle Kanban/Tabela + filtro unidade + busca cargo/gestor/unidade/depto
- [x] API Express+Prisma+SQLite (`include: { cargo: true }` em `GET /vagas`) — `vagasController`+`parametrosController` discriminated union types

## Backlog
- [ ] Filtros avançados (departamento, gestor, SLA) + ordenação/paginação
- [ ] Autenticação e permissões
- [ ] Histórico de movimentações e auditoria
- [ ] Notificações SLA e dashboard analítico
- [ ] Testes (unit/integration/e2e) e CI/CD

## Ideias
- [ ] Preview de agrupamento no DND
- [ ] Bulk actions
- [ ] Integração ATS externo
