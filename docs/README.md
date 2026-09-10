# Kanban de Vagas - Hire Ops

## Visão Geral

Aplicação de gestão de recrutamento e seleção com quadro Kanban para controle de requisições de vagas. Permite criar, editar, duplicar, excluir e mover vagas entre status via drag & drop, com agrupamento automático e fracionamento de headcount.

## Tecnologias

**Frontend:** React 19 + TypeScript 6 + Vite 8 + Mantine 9 (@mantine/core, @mantine/hooks) + @hello-pangea/dnd + @tabler/icons-react + @emotion/react
**Backend:** Node.js + Express 5 + Prisma 5 + SQLite + TypeScript + tsx
**Estilização:** Mantine CSS + CSS Modules (Tailwind não utilizado neste projeto)

## Estrutura

```
H:/RH/
├── backend/  -> API Express (porta 3333)
│   ├── prisma/schema.prisma
│   └── src/{server.ts, routes.ts, controllers/, database/}
└── frontend/ -> SPA React (porta 5173)
    └── src/{App.tsx, components/Kanban/, components/Modals/, services/api.ts}
```

## Como Rodar Localmente

### Pré-requisitos

Node.js 18+ e npm

### 1. Backend

```bash
cd backend
npm install
# configurar .env com DATABASE_URL="file:./dev.db" (já existe)
npx prisma migrate dev
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

### Endpoints Base

`API_BASE = http://localhost:3333/api` (definido em `frontend/src/services/api.ts`)
