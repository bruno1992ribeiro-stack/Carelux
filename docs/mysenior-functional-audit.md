# Auditoria funcional MySenior — Fase 0

Data do levantamento: 2026-08-04. Âmbito: observação funcional em modo de leitura da sessão autenticada indicada pelo utilizador e inspeção estática, sem alterações, do repositório CareLux.

## Regras e classificação

- **OBSERVADO**: elemento visível ou rota efetivamente aberta.
- **INFERIDO**: conclusão funcional sustentada por mais de um elemento observado, mas não validada por uma operação.
- **NÃO CONFIRMADO**: não foi possível verificar com segurança, sem dados reais ou sem executar uma ação proibida.
- **REQUISITO CARELUX**: regra interna do CareLux; não corresponde a uma funcionalidade observada no MySenior.
- Não foram guardadas capturas, nomes, fotografias, contactos, moradas, identificadores, dados financeiros, clínicos, medicação individual, credenciais, cookies, tokens ou dados de sessão.
- Os botões de gravação, exportação, impressão, alteração de estado e operações clínicas nunca foram acionados.

## Âmbito observado

| Módulo | Estado | Objetivo funcional resumido |
|---|---|---|
| Início | OBSERVADO | Visão operacional por turno e atalhos para alertas, ocorrências, comunicações, ausências, visitas, saúde, aniversários, diários e atividades. |
| Utentes | OBSERVADO | Pesquisa, segmentação por zona, criação e consulta da população acompanhada. |
| Ativ. Vida Diária | OBSERVADO | Organização de grupos e gestão de planos/atividades de vida diária. |
| Desenv. Pessoal | OBSERVADO | Calendário, mapa e relatório de atividades de desenvolvimento pessoal. |
| Saúde | OBSERVADO | Entrada para Consultas, Vacinas, Terapêuticas, Feridas e informação geral. |
| Estatísticas | OBSERVADO | Catálogo de indicadores operacionais, demográficos, de atividade e ocorrências. |
| Mensalidades | OBSERVADO | Pesquisa de mensalidades, produtos, evolução mensal, relatório e exportação. |
| Funcionários | OBSERVADO | Pesquisa, criação, relatórios, perfis, acessos, funções e PINs. |
| Candidaturas | OBSERVADO | Pesquisa, criação, critérios e histórico de candidaturas. |
| Administração | OBSERVADO | Dados da organização e faturação/subscrição. |
| Registo Diário | NÃO CONFIRMADO | Entrada visível, mas sem rota/página aberta nesta sessão. |
| Atividades | OBSERVADO | Secção do dashboard com atividades de desenvolvimento pessoal; rota autónoma não confirmada. |

## Dashboard

**OBSERVADO:** cartões de Atividades por turno, Observações por ler, Alertas em vigor/por tomar conhecimento, Ocorrências, Comunicações, Ausências, Visitas, Vacinas, Feridas, Consultas, Aniversários, Entradas no Registo Diário, contadores de Diários por área profissional e agenda de Desenvolvimento Pessoal. Foram observados estados vazios com “Não existe informação” e contadores a zero.

**INFERIDO:** os cartões agregam dados de vários módulos e podem funcionar como atalhos contextuais. As métricas por turno pressupõem relação entre unidade/resposta social, turno e registo operacional.

**NÃO CONFIRMADO:** comportamento ao abrir cada cartão, atualização automática, loading, erro, notificações/toasts, responsive e regras de visibilidade por perfil.

## Padrões transversais observados

- Pesquisa textual nas listas de Utentes, Mensalidades, Funcionários e Candidaturas.
- Filtro por zona em Utentes e acesso a gestão de zonas.
- Ações de relatório em Desenvolvimento Pessoal, Mensalidades, Funcionários e Consultas.
- Exportação visível em Mensalidades, não executada.
- Vistas temporal e de apresentação em Consultas: Hoje, Dia, Semana e Lista.
- Ações administrativas explícitas para perfis, acessos e funções de funcionários.
- Modais simples de criação/gestão com Fechar e Gravar em vários módulos; nenhum foi submetido.
- Não foram observadas ações em massa, paginação, ordenação explícita, drawers, timelines de detalhe, confirmações, toasts de sucesso/erro ou loading. Isto significa **NÃO CONFIRMADO**, não ausência funcional.

## CareLux existente

**OBSERVADO no repositório CareLux:** Next.js App Router com dashboard, autenticação NextAuth, isolamento por cliente/unidade, permissões, Prisma/PostgreSQL e módulos para clientes, unidades, quartos, camas, utentes, contactos, funcionários, utilizadores e definições. Existem formulários e serviços/repositórios para unidades, quartos, camas, utentes, contactos e funcionários; existem componentes CareLux reutilizáveis para cartões, botões, inputs e diálogos.

**Parcial:** Utentes já tem lista, detalhe, criação, edição, resumo, alertas, timeline e ações. Funcionários possui rota, serviço, repositório e ações. Contactos/familiares possui rota e módulo. O dashboard já calcula unidades, quartos, camas, ocupação e utentes ativos.

**Ainda inexistente no modelo/rotas observados:** AVD, Desenvolvimento Pessoal, consultas, vacinação, terapêutica, feridas, estatísticas avançadas, mensalidades/produtos, candidaturas, registo diário operacional e respetivos históricos/auditoria de domínio.

## Limitações e riscos

- A sessão revelou dados pessoais na interface; foram ignorados e não reproduzidos.
- Não foram abertas páginas de detalhe dependentes da seleção de pessoas reais.
- Formulários que exigiam selecionar utentes, funcionários ou registos reais não foram explorados além da estrutura inicial segura.
- Não foram executados relatórios, exportações, downloads, impressão ou alterações.
- Responsive não foi alterado, para evitar perturbar a aba do utilizador; carece de validação manual.
- O DOM legado nem sempre associa labels semanticamente aos campos; algumas obrigatoriedades só são visíveis por mensagem genérica e precisam de validação manual.
