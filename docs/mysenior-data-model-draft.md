# Modelo de dados preliminar

Este documento não altera o Prisma. Só regista entidades suportadas pelo observado.

## Já existentes no CareLux

| Entidade | Atributos genéricos existentes relevantes | Relações |
|---|---|---|
| Client | identificação, contacto, plano/estado de subscrição | 1:N Facility, User, Role |
| Facility | identificação, endereço, contacto, estado | N:1 Client; 1:N Room, Resident, Staff |
| Room / Bed | número/identificador, capacidade, estado | Facility → Room → Bed |
| Resident | nome, nascimento, género, admissão, estado | N:1 Facility/Room/Bed; 1:N Contact |
| ResidentContact | nome, relação, contacto, representante | N:1 Resident |
| User / Staff | conta, função, estado e dados profissionais | N:1 Client/Facility/Role |
| Role / Permission | código e associação N:N | âmbito global ou cliente |

## Entidades aparentes adicionais

| Entidade | Classificação | Atributos/estados suportados | Relações/cardinalidade provável |
|---|---|---|---|
| SocialResponse | OBSERVADO | nome; estado ativo aparente | Relações e cardinalidades **NÃO CONFIRMADAS** |
| Zone | OBSERVADO | nome | Relação com Resident **INFERIDA**; cardinalidade **NÃO CONFIRMADA** |
| Shift | OBSERVADO | nome, hora, atual/anterior | Facility/SocialResponse 1:N (**INFERIDO**) |
| DailyLivingGroup | OBSERVADO | nome | 1:N plano/atividade (**INFERIDO**) |
| PersonalDevelopmentActivity | OBSERVADO | nome, data/hora, unidade | participantes N:N (**INFERIDO**) |
| Appointment | OBSERVADO | nome/tipo Interna ou Externa; data implícita no calendário | Appointment N:1 Resident — **INFERIDO**; Appointment N:1 Professional — **INFERIDO** |
| VaccineCatalog | INFERIDO | nome | 1:N registos de vacinação (**NÃO CONFIRMADO**) |
| VaccinationRecord | INFERIDO | data/estado não observados diretamente | Resident N:1; catálogo N:1 |
| Therapeutic/Medication | OBSERVADO | associação pesquisável por utente e vista por medicamento | Resident N:1; medicamento N:1 (**INFERIDO**) |
| WoundCatalog / WoundType | INFERIDO | nome de tipo observado no modal; natureza de catálogo **NÃO CONFIRMADA** | Relação com WoundRecord **NÃO CONFIRMADA** |
| WoundRecord | INFERIDO | estado por tratar visível no dashboard; restantes atributos **NÃO CONFIRMADOS** | Relação com Resident **INFERIDA**; cardinalidade **NÃO CONFIRMADA** |
| Occurrence | OBSERVADO | turno, estado de tomada de conhecimento, tipo implícito | Resident/Facility/Shift (**INFERIDO**) |
| Communication | OBSERVADO | turno, tomada de conhecimento | Facility/Shift; autor e destinatários (**INFERIDO**) |
| Absence | OBSERVADO | atual/próxima, observação por ler | Resident e intervalo temporal (**INFERIDO**) |
| Visit | OBSERVADO | agendada/ocorrida, validação de pessoa relacionada | Resident e Contact (**INFERIDO**) |
| DailyLogEntry | OBSERVADO | área profissional e contagem | Resident, autor, profissão, turno (**INFERIDO**) |
| Fee/MonthlyCharge | OBSERVADO | período, produto, valor/estado não confirmados | Resident, Product, Facility (**INFERIDO**) |
| Product | OBSERVADO | existência de gestão | Fee N:1 (**INFERIDO**) |
| Application | OBSERVADO | nome, critérios, histórico | Facility N:1; estados não confirmados |
| AuditEvent | REQUISITO CARELUX | estrutura concreta **NÃO CONFIRMADA** | necessário para saúde, finanças e operações; não observado como entidade no MySenior |

## Enums aparentes

- AppointmentType: `INTERNAL`, `EXTERNAL` — OBSERVADO.
- TemporalStatus: atual, anterior, próximo — OBSERVADO como categorias; modelo exato NÃO CONFIRMADO.
- AcknowledgementStatus: por tomar conhecimento/conhecido — INFERIDO.
- VisitStatus: agendada/ocorrida — OBSERVADO.
- ApplicationStatus, FeeStatus, MedicationAdministrationStatus e WoundStatus — NÃO CONFIRMADO.

## Multi-tenant, auditoria e sensibilidade

- Validar `clientId` e `facilityId` e rejeitar relações cruzadas no servidor — **REQUISITO CARELUX**. A forma de modelação ainda não está definida.
- Histórico imutável, auditoria e histórico de correções/alterações em saúde, terapêutica, feridas, ocorrências, turnos, atividades e finanças — **REQUISITO CARELUX**.
- Isolamento multi-tenant em todas as operações — **REQUISITO CARELUX**.
- Dados de saúde, medicação, contacto, identificação e finanças são especialmente sensíveis; aplicar minimização, autorização por campo/ação e logs sem payload sensível.
- Não está autorizada qualquer alteração ao Prisma. Campos, cardinalidades, retenção, arquivo e base legal carecem de validação explícita.
