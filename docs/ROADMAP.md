# Roadmap - Kanban de Vagas

## Concluído e Validado
- [x] Kanban 5 colunas (Em Aberto, Em Andamento, Congelado, Concluído, Cancelado) com drag & drop (@hello-pangea/dnd) e reordenação
- [x] CRUD de vagas (criar, editar, duplicar, excluir) e cargos
- [x] Campo `quantidade` (headcount) com badge condicional (`QTD` só se >1)
- [x] Cabeçalho minimalista `Status (N)` e MetricasBar dinâmica `{X} Processos Ativos ({Y} vagas no total)`
- [x] Agrupamento automático por chave (cargoId+gestor+departamento+unidade) na criação e no mover
- [x] Movimentação parcial com `MoverVagaModal` e `POST /vagas/:id/desmembrar`
- [x] Fluxo atômico `pendingDrag` anti-flicker no DND de cards agrupados
- [x] Modais `ConfirmarExclusaoModal`, `MoverVagaModal`, `NovaVagaModal` (Mantine)
- [x] API Express + Prisma + SQLite com endpoints GET/POST/PUT/PATCH/DELETE
- [x] SLA, nivel, tipoContrato e indicadores de prazo nos cards

## Backlog / Futuras Melhorias
- [ ] Filtros e busca (por cargo, gestor, departamento, unidade, recrutador)
- [ ] Ordenação e paginação no backend
- [ ] Autenticação e controle de permissões por perfil
- [ ] Histórico/auditoria de movimentações de status
- [ ] Notificações e alertas de SLA (ex: vencimento em X dias)
- [ ] Dashboard analítico (tempo médio por etapa, taxa de conversão)
- [ ] Upload de anexos e observações por vaga
- [ ] Testes automatizados (unit, integration, e2e) e CI/CD
- [ ] Suporte a temas e internacionalização

## Ideias em Avaliação
- [ ] Drag & drop com pré-visualização de agrupamento
- [ ] Bulk actions (mover/fechar múltiplos processos)
- [ ] Integração com ATS externo
