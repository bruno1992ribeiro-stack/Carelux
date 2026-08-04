# Plano de scaffolding CareLux

Plano futuro, não executado. Todo o conteúdo proposto neste documento é **INFERIDO** ou **REQUISITO CARELUX**, nunca uma capacidade observada no MySenior. Nenhuma rota futura está aprovada e nenhuma alteração ao Prisma está autorizada. Cada etapa precisa de aprovação explícita antes da implementação e deve preservar rotas, serviços, modelos e componentes existentes. A identidade visual continua a ser exclusivamente CareLux.

## Etapa MS-1 — Contratos e navegação sem domínio novo

- **Objetivo:** fechar nomes, boundaries e matriz de permissões.
- **Rotas:** apenas proposta/documentação para AVD, desenvolvimento pessoal, saúde, estatísticas, mensalidades, candidaturas e registo diário.
- **Componentes:** inventário de Card, Button, Input, Dialog, PageContainer, sidebar/header e padrões responsive existentes.
- **Entidades:** validar SocialResponse, Zone, Shift e AuditEvent.
- **Formulários:** nenhum.
- **Permissões:** mapear permissões atuais e lacunas por ação.
- **Dependências:** validação de produto e segurança.
- **Conclusão:** ADR/contratos aprovados, sem conflitos de rotas.
- **Riscos/validações:** nomenclatura duplicada, encoding pt-PT, isolamento tenant.

## Etapa MS-2 — Consolidar Utentes existente

- **Objetivo:** reutilizar `/dashboard/residents` e colmatar apenas lacunas aprovadas.
- **Rotas:** manter `/dashboard/residents`, `/dashboard/residents/new`, `/dashboard/residents/[id]` e `/dashboard/residents/[id]/edit`.
- **Componentes:** ResidentForm, cards/lista responsive, timeline e alertas existentes.
- **Entidades:** Resident, ResidentContact, Facility, Room, Bed; avaliar Zone/SocialResponse.
- **Formulários:** extensão incremental do utente, nunca substituição total.
- **Permissões:** VIEW/CREATE/EDIT/ARCHIVE/RESTORE_RESIDENT.
- **Dependências:** decisão sobre arquivo versus estados atuais.
- **Conclusão:** loading/empty/success/error/disabled e mobile/desktop validados.
- **Riscos:** dados sensíveis, migração de atributos, atual botão de eliminação a alinhar com arquivo.

## Etapa MS-3 — Base operacional (respostas, zonas e turnos)

- **Objetivo:** criar fundamentos partilhados pelos módulos operacionais.
- **Rotas:** páginas de configuração dentro de settings, não novas áreas duplicadas.
- **Componentes:** listas, filtros e diálogos CareLux reutilizáveis.
- **Entidades:** SocialResponse, Zone, Shift.
- **Formulários:** nome, estado e associação à unidade; campos finais por validar.
- **Permissões:** administração por facility/client.
- **Dependências:** Etapas MS-1 e MS-2.
- **Conclusão:** validação server-side de tenant e auditoria de alterações.
- **Riscos:** cardinalidades ainda inferidas.

## Etapa MS-4 — AVD e Registo Diário mínimo

- **Objetivo:** grupos/planos e entradas operacionais auditáveis.
- **Rotas:** `/dashboard/daily-living`, `/dashboard/daily-log`.
- **Componentes:** cards de grupos, lista/agenda, filtros por turno, modal/detalhe.
- **Entidades:** DailyLivingGroup, plano/atividade, DailyLogEntry, Shift, Resident, Staff.
- **Formulários:** grupo e entrada diária; estrutura clínica excluída até validação.
- **Permissões:** equipa operacional por unidade/turno; auditoria obrigatória.
- **Dependências:** Etapa MS-3 e política de correções.
- **Conclusão:** nenhum cross-tenant, idempotência e histórico de alterações.
- **Riscos:** confundir catálogo com ato realizado; submissões duplicadas.

## Etapa MS-5 — Desenvolvimento Pessoal

- **Objetivo:** calendário/mapa/lista e presenças.
- **Rotas:** `/dashboard/personal-development` e detalhe de atividade.
- **Componentes:** calendário acessível, filtros, cartões e relatório preparado sem exportar por defeito.
- **Entidades:** Activity, Participant, Attendance, Staff, Facility.
- **Formulários:** atividade, participantes e presença.
- **Permissões:** equipa técnica e administração.
- **Dependências:** Etapa MS-3.
- **Conclusão:** vistas dia/semana/lista, estados completos e mobile.
- **Riscos:** dados de participação e concorrência na marcação.

## Etapa MS-6 — Saúde por slices independentes

- **Objetivo:** implementar separadamente Consultas, Vacinação, Terapêutica e Feridas.
- **Rotas:** `/dashboard/health/appointments`, `/dashboard/health/vaccinations`, `/dashboard/health/therapeutics` e `/dashboard/health/wounds`.
- **Componentes:** shell Saúde partilhada; calendário/listas; histórico/auditoria.
- **Entidades:** Appointment primeiro; restantes apenas após validação clínica.
- **Formulários:** React Hook Form/Zod por ato e catálogos separados.
- **Permissões:** VIEW/EDIT_APPOINTMENT, VIEW/EDIT_MEDICATION e novas permissões granulares.
- **Dependências:** auditoria, política clínica e revisão de privacidade.
- **Conclusão:** cada slice isolado, auditado, testado e aprovado antes do seguinte.
- **Riscos:** segurança clínica, dosagem/administração, dados sensíveis e correções.

## Etapa MS-7 — Candidaturas

- **Objetivo:** pipeline, critérios e histórico sem duplicar Resident.
- **Rotas:** `/dashboard/applications` e detalhe.
- **Componentes:** lista, filtros, estado vazio, histórico.
- **Entidades:** Application, Criterion, StatusHistory; conversão controlada para Resident.
- **Formulários:** candidatura e critérios.
- **Permissões:** administração/direção por unidade.
- **Dependências:** estados e retenção aprovados.
- **Conclusão:** transições válidas, auditoria e prevenção de duplicados.
- **Riscos:** dados pessoais pré-admissão e retenção.

## Etapa MS-8 — Mensalidades

- **Objetivo:** produtos, períodos e cobranças, começando em read-only.
- **Rotas:** `/dashboard/fees`, `/dashboard/fees/products` e `/dashboard/fees/reports`.
- **Componentes:** tabela responsive, filtros, evolução e exportação protegida.
- **Entidades:** Product, MonthlyCharge, Period, Adjustment/AuditEvent.
- **Formulários:** produto e lançamento/ajuste após validação contabilística.
- **Permissões:** VIEW_FINANCE, EDIT_FINANCE, EXPORT_DATA.
- **Dependências:** política financeira e auditoria.
- **Conclusão:** valores determinísticos, concorrência e exportação autorizada testadas.
- **Riscos:** dados financeiros, arredondamento, dupla cobrança.

## Etapa MS-9 — Estatísticas e dashboard

- **Objetivo:** projeções agregadas sobre módulos já implementados.
- **Rotas:** `/dashboard/statistics`; evolução incremental do `/dashboard`.
- **Componentes:** cartões CareLux, gráficos acessíveis e filtros.
- **Entidades:** preferir queries/read models; não duplicar dados sem necessidade.
- **Formulários:** filtros de período, unidade e dimensão.
- **Permissões:** derivadas da fonte, com supressão de grupos pequenos.
- **Dependências:** módulos de origem estabilizados.
- **Conclusão:** métricas definidas, testadas e sem exposição indevida.
- **Riscos:** inferência de dados sensíveis e cálculos inconsistentes.

## Checklist transversal de conclusão

- pt-PT, CareLux, Inter/DM Serif Display e design system existente.
- React Hook Form + Zod; trim; cliente + servidor; TypeScript estrito.
- 44×44 px, foco visível, sem depender só de cor, reduced motion.
- loading, vazio, sucesso, erro, inválido e disabled testados em mobile/desktop.
- idempotência e autorização server-side; tenant/facility sempre validados.
- sem migrações ou dependências até aprovação explícita de cada etapa.
