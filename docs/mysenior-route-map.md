# Mapa de rotas MySenior e correspondência CareLux

## Rotas observadas

| Módulo/página | Rota MySenior | Estado | Correspondência CareLux atual |
|---|---|---|---|
| Início | `#/dashboard` | OBSERVADO | `/dashboard` (parcial) |
| Utentes — lista | `#/seniors` | OBSERVADO | `/dashboard/residents` |
| Utentes — criação | `#/seniors/add` | OBSERVADO | `/dashboard/residents/new` |
| AVD — grupos/planos | `#/plans` | OBSERVADO | Inexistente |
| Desenvolvimento Pessoal | `#/personaldev` | OBSERVADO | Inexistente |
| Saúde — entrada | `#/health` | OBSERVADO | Inexistente |
| Saúde — Consultas | `#/health/appointments` | OBSERVADO | Inexistente; permissões já previstas |
| Saúde — Vacinas | `#/health/vaccines` | OBSERVADO | Inexistente |
| Saúde — Terapêuticas | `#/health/therapeutics` | OBSERVADO | Inexistente; permissões de medicação já previstas |
| Saúde — Feridas | `#/health/wounds` | OBSERVADO | Inexistente |
| Estatísticas | `#/statistics` | OBSERVADO | Inexistente |
| Mensalidades | `#/accounting` | OBSERVADO | Inexistente; permissões financeiras já previstas |
| Funcionários | `#/employees` | OBSERVADO | `/dashboard/staff` (parcial) |
| Candidaturas | `#/candidatures/` | OBSERVADO | Inexistente |
| Administração | `#/admin` | OBSERVADO | `/dashboard/settings`, `/dashboard/users`, `/admin` (distribuído/parcial) |
| Registo Diário | — | NÃO CONFIRMADO | Inexistente |
| Atividades no dashboard | `#/dashboard` | OBSERVADO | Sem rota autónoma confirmada |

## Rotas CareLux existentes a preservar

- `/`, `/login`, `/admin`, `/dashboard`
- `/dashboard/facilities`, `/dashboard/facilities/new`, `/dashboard/facilities/[id]`, `/dashboard/facilities/[id]/edit`
- `/dashboard/rooms`, `/dashboard/rooms/new`, `/dashboard/rooms/[id]`, `/dashboard/rooms/[id]/edit`
- `/dashboard/beds`, `/dashboard/beds/new`, `/dashboard/beds/[id]`, `/dashboard/beds/[id]/edit`
- `/dashboard/residents`, `/dashboard/residents/new`, `/dashboard/residents/[id]`, `/dashboard/residents/[id]/edit`
- `/dashboard/contacts`, `/dashboard/staff`, `/dashboard/clients`
- `/dashboard/users`, `/dashboard/settings`
- `/api/auth/[...nextauth]`

## Proposta de namespaces futuros — INFERIDO

Estas rotas são **INFERIDAS** para scaffolding, não implementação aprovada:

- `/dashboard/daily-living`
- `/dashboard/personal-development`
- `/dashboard/health/appointments`
- `/dashboard/health/vaccinations`
- `/dashboard/health/therapeutics`
- `/dashboard/health/wounds`
- `/dashboard/statistics`
- `/dashboard/fees`
- `/dashboard/fees/products`
- `/dashboard/fees/reports`
- `/dashboard/applications`
- `/dashboard/daily-log`

Nenhuma destas rotas futuras está aprovada. Evitar aliases que concorram com `/dashboard/residents`, `/dashboard/staff`, `/dashboard/settings` e `/admin`. A nomenclatura final deve seguir os padrões atuais do CareLux e manter URLs em inglês, com interface em pt-PT.
