# Kanban de Vagas - Hire Ops

## Visão Geral
Aplicação de gestão de recrutamento e seleção com quadro Kanban para controle de requisições de vagas. Permite criar, editar, duplicar, excluir e mover vagas entre status via drag & drop, com agrupamento automático e fracionamento de headcount. Inclui **Módulo de Configurações e Parâmetros** para cadastro de Cargos, Unidades e Gestores com herança automática no formulário de vagas.

## Tecnologias
**Frontend:** React 19 + TypeScript 6 + Vite 8 + Mantine 9 (@mantine/core, @mantine/hooks) + @hello-pangea/dnd + @tabler/icons-react + @emotion/react
**Backend:** Node.js + Express 5 + Prisma 5 + SQLite + TypeScript + tsx
**Estilização:** Mantine CSS + CSS Modules (Tailwind não utilizado neste projeto)

## Estrutura
```
H:/RH/
├── backend/               # API Express (porta 3333)
│   ├── prisma/schema.prisma  # Cargo(uuid, categoria, 5 salários, cargaHoraria), Unidade, Gestor, Vaga(cargoId, salario, centroDeCusto, subEtapa, statusAdmissao, candidatoNome, dataAdmissao), Candidato, HistoricoAdmissao
│   └── src/{server.ts, routes.ts, controllers/{vagasController,parametrosController,candidatosController}, database/prismaClient.ts}
└── frontend/              # SPA React (porta 5173)
    └── src/{App.tsx, main.tsx, pages/ConfiguracoesPage.tsx, components/{Kanban/{KanbanBoard,KanbanColumn,VagaCard,BulkActionToolbar}, Layout/{AppHeader,AppSidebar}, Modals/{NovaVagaModal,CargoModal,MoverVagaModal,ConfirmarExclusaoModal,VagaDetalhesModal,DecisaoAdmissaoModal}, MetricasBar, VagasTable}, services/api.ts, types/vaga.ts, utils/formatters.ts}
```

## Como Rodar Localmente

### Pré-requisitos
Node.js 18+ e npm

### 1. Backend
```bash
cd backend
npm install
# configurar .env com DATABASE_URL="file:./dev.db" (já existe)
npx prisma db push
npx prisma generate
npx tsx src/server.ts
# ou com watch: npx tsx watch src/server.ts
# API em http://localhost:3333/api
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
# App em http://localhost:5173
```

### Build
```bash
# frontend
npm run build   # tsc -b && vite build
npm run preview
# backend
npx tsc --noEmit
```

## Estado Atual — v0.4.0 (2026-09-14)
- Admissão 100% inline `VagaCard Popover 300px right-start` (`Nome + Data` + `Resultado/Radio` + `Retorno Select 02/04/07 default 07` + `Motivo`; `closeOnClickOutside false` `commit atômico` só no `Salvar`; `dataVencida ≤ hoje` decide imediato, `> hoje` fica pendente → sino).
- Pipeline A&S 02–08 em `Em Andamento` (`subEtapa` default `ALINHAMENTO`; Pill `UnstyledButton 11px` minimalista + `IconChevronDown`).
- Seleção em lote (`rail 24px/6px 0.2s` + círculo `20px IconCheck` + `Shift/Ctrl/Cmd` + `user-select: none` + `BulkActionToolbar fixed Transition slide-up` + trava `isSubEtapaLocked` quando `Shift` ou `Bulk`).
- `AppHeader` sino `(N) Pendentes` híbrido: `Aprovar 1 clique` + `Reprovar` expande `Motivo+Retorno` `120px` inline (`02/04/07`).
- `formatarDataLocal`/persistência `12h` corrige timezone; `VagaCard` hover/seleção `blue.2 #a5d8ff`, título `12px`, drag `xl z5000`.

## Fluxo rápido para retomar amanhã
1. `cd backend && npx prisma db push && npx prisma generate` (se necessário) → `npm run dev` (porta 3333)
2. `cd frontend && npm run dev` (porta 5173)
3. Fluxo: `Em Andamento → subEtapa 08` → preencher admissão → decidir via modal ou sino; bulk via checkbox/Shift.
4. Checkpoint git: `stash@{0} = checkpoint-stable-2026-09-13` — diga `volte` para restaurar.

## Endpoints Base
`API_BASE = http://localhost:3333/api` (definido em `frontend/src/services/api.ts` ↔ `backend/src/routes.ts`)

| Método | Rota | Função | Retorno |
|--------|------|--------|---------|
| GET | /vagas | getVagas | Vaga[] (`include: { cargo: true }`) |
| POST | /vagas | createVaga | `{agrupado:true,vaga}` ou Vaga |
| PUT | /vagas/:id | updateVaga | Vaga |
| DELETE | /vagas/:id | deleteVaga | 204 |
| PATCH | /vagas/:id/status | updateStatus | AtualizarStatusResponse |
| PATCH | /vagas/:id/subetapa | updateSubEtapa | Vaga |
| PATCH | /vagas/bulk-subetapa | bulkUpdateSubEtapa | Vaga[] |
| PATCH | /vagas/:id/admissao | salvarAdmissao | Vaga |
| POST | /vagas/:id/decisao-admissao | decisaoAdmissao | Vaga |
| POST | /vagas/:id/desmembrar | desmembrarVaga | DesmembrarResponse |
| GET | /vagas/:vagaId/candidatos | listarPorVaga | Candidato[] |
| POST/PUT/DELETE | /candidatos | criar/atualizar/remover | Candidato |
| GET/POST/PUT/DELETE | /cargos | getCargos/createCargo/updateCargo/deleteCargo | Cargo/Cargo[] |
| GET/POST/DELETE | /unidades | getUnidades/createUnidade/deleteUnidade | Unidade/Unidade[] |
| GET/POST/DELETE | /gestores | getGestores/createGestor/deleteGestor | Gestor/Gestor[] |
