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
│   ├── prisma/schema.prisma  # Cargo(uuid, categoria, 5 salários, cargaHoraria), Unidade, Gestor, Vaga(cargoId string, salario, centroDeCusto)
│   └── src/{server.ts, routes.ts, controllers/{vagasController,parametrosController}, database/}
└── frontend/              # SPA React (porta 5173)
    └── src/{App.tsx, pages/ConfiguracoesPage.tsx, components/{Kanban/{KanbanBoard,KanbanColumn,VagaCard}, Layout/{AppHeader,AppSidebar}, Modals/{NovaVagaModal,CargoModal,MoverVagaModal,ConfirmarExclusaoModal}, MetricasBar, VagasTable}, services/api.ts, types/vaga.ts}
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

## Endpoints Base
`API_BASE = http://localhost:3333/api` (definido em `frontend/src/services/api.ts` ↔ `backend/src/routes.ts`)

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
