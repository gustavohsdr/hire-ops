# Kanban de Vagas - Hire Ops

## Visão Geral
Kanban de recrutamento 5 colunas (Em Aberto → Cancelado) + visão Tabela, agrupamento automático por `cargo+nivel+gestor+depto+unidade+contrato+dia SLA`, fracionamento `pendingDrag` atômico, **Módulo de Configurações e Parâmetros** (Cargos, Unidades, Gestores), herança automática Cargo → Vaga (categoria/SLA/carga/salário por nível) e proteção de dados salariais. 100% Mantine.

## Tecnologias
**Frontend:** React 19 • TypeScript 6 • Vite 8 • Mantine 9 (@mantine/core, @mantine/hooks) • @hello-pangea/dnd • @tabler/icons-react • @emotion/react  
**Backend:** Node • Express 5 • Prisma 5 • SQLite • TypeScript • tsx  
**Estilo:** Mantine CSS + CSS Modules (Tailwind não utilizado)

## Estrutura
```
H:/RH/
├── backend/               # http://localhost:3333/api
│   ├── prisma/schema.prisma  # Cargo(uuid, categoria, 5 salários, cargaHoraria), Unidade, Gestor, Vaga(cargoId string, salario, centroDeCusto)
│   └── src/{server.ts, routes.ts, controllers/{vagasController,parametrosController}, database/}
└── frontend/              # http://localhost:5173
    └── src/{App.tsx, pages/ConfiguracoesPage.tsx, components/{Kanban/{KanbanBoard,KanbanColumn,VagaCard}, Layout/{AppHeader,AppSidebar}, Modals/{NovaVagaModal,CargoModal,MoverVagaModal,ConfirmarExclusaoModal}, MetricasBar, VagasTable}, services/api.ts, types/vaga.ts}
```

## Rodar Local
```bash
# backend
cd backend
npm install
npx prisma db push
npx prisma generate
npx tsx src/server.ts  # http://localhost:3333/api

# frontend
cd frontend
npm install
npm run dev    # http://localhost:5173
npm run build  # tsc -b && vite build
```

## Funcionalidades Chave
- Kanban viewport fixo `100vh` sem scroll global; colunas `height 100%` com `ScrollArea` vertical independente
- VagaCard compacto `padding 8`: badge categoria dinâmica (`blue`/`orange`) + SLA `borderLeft` + `Tooltip` condicional + título `fw600 fz13` truncado + rodapé `gap4` sem separador `•`
- NovaVagaModal tela única `size lg` sem Stepper; herança automática Cargo → Vaga (categoria/departamento/centroDeCusto/SLA/cargaHoraria/salário por nível)
- CargoModal `size lg` `cols2` rótulos por extenso + `Carga Horária` + 5 salários com máscara olhinho `IconEye/Off` (`WebkitTextSecurity disc`)
- MetricasBar `minHeight 88 Group h20 baseline` headcount (`dentro/total no prazo` em DENTRO DO SLA)
- ConfiguracoesPage `Tabs` CRUD Cargos/Unidades/Gestores + `AppSidebar` navegação
- Tooltips Mantine delicados (`withArrow false`) com disparo condicional apenas quando truncado

## Endpoints Base
`API_BASE = http://localhost:3333/api` (`frontend/src/services/api.ts` ↔ `backend/src/routes.ts`)

| Método | Rota | Função | Retorno |
|--------|------|--------|---------|
| GET | /vagas | getVagas | Vaga[] (`include:{cargo:true}`) |
| POST | /vagas | createVaga | `{agrupado:true,vaga}` ou Vaga |
| PUT | /vagas/:id | updateVaga | Vaga |
| DELETE | /vagas/:id | deleteVaga | 204 |
| PATCH | /vagas/:id/status | updateStatus | AtualizarStatusResponse |
| POST | /vagas/:id/desmembrar | desmembrarVaga | DesmembrarResponse |
| GET/POST/PUT/DELETE | /cargos | getCargos/createCargo/updateCargo/deleteCargo | Cargo/Cargo[] |
| GET/POST/DELETE | /unidades | getUnidades/createUnidade/deleteUnidade | Unidade/Unidade[] |
| GET/POST/DELETE | /gestores | getGestores/createGestor/deleteGestor | Gestor/Gestor[] |
