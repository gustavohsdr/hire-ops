# Kanban de Vagas - Hire Ops

## Visão Geral
Gestão de recrutamento com Kanban (5 colunas), Tabela, Header + Sidebar, métricas por headcount e DND com agrupamento/fracionamento atômico. Stack 100% Mantine.

## Tecnologias
**Frontend:** React 19 • TypeScript 6 • Vite 8 • Mantine 9 (core/hooks) • @hello-pangea/dnd • @tabler/icons-react • @emotion/react  
**Backend:** Node • Express 5 • Prisma 5 • SQLite • tsx  
**Estilo:** Mantine apenas (Tailwind não usado)

## Estrutura
```
H:/RH/
├── backend/               # API http://localhost:3333/api
│   ├── prisma/schema.prisma  # Cargo, Vaga (quantidade, status, slaDias)
│   └── src/{server.ts, routes.ts, controllers/vagasController.ts}
└── frontend/              # SPA http://localhost:5173
    └── src/{App.tsx, main.tsx, components/{Kanban/{KanbanBoard,KanbanColumn,VagaCard}, Layout/{AppHeader,AppSidebar}, Modals/{NovaVagaModal,MoverVagaModal,ConfirmarExclusaoModal}, MetricasBar, VagasTable}, services/api.ts, types/vaga.ts}
```

## Rodar Local
```bash
# backend
cd backend
npm install
npx prisma migrate dev
npx prisma generate
npx tsx src/server.ts  # http://localhost:3333/api

# frontend
cd frontend
npm install
npm run dev    # http://localhost:5173
npm run build  # tsc -b && vite build
```

## Funcionalidades Chave
- Kanban 5 status + drag horizontal overlay (ScrollArea hover) e colunas com scroll vertical interno
- Título do card truncado (1 linha, ellipsis + title tooltip) e simetria de padding
- Criação/edits em wizard 3 passos (Stepper) dentro de Paper com borda
- `pendingDrag` ghost (opacidade 0.6, borda tracejada) sem flicker
- Filtros: busca (cargo/gestor/unidade/depto) + unidade + toggle Kanban/Tabela
