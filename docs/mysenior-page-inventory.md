# Inventário de páginas

Os elementos das páginas visitadas são **OBSERVADOS**. As lacunas assinaladas são **NÃO CONFIRMADAS**, não funcionalidades declaradamente inexistentes.

## Páginas visitadas

| Página | Tipo | Elementos observados | Lacunas não confirmadas |
|---|---|---|---|
| Dashboard | dashboard | cartões, contadores, estados vazios, agenda, categorias de diário | detalhe, loading, erros, responsive |
| Utentes | lista | pesquisa, filtro por zona, gerir zonas, Novo Utente | colunas e ações por linha ocultadas para evitar dados pessoais; paginação/ordenação |
| Novo Utente | criação | formulário longo, grupos de identificação, admissão e contacto; Voltar/Gravar | mensagens de erro e confirmação, submissão |
| AVD | gestão em cartões/grupos | Novo Grupo e Gerir por grupo | detalhe dos grupos, ações internas |
| Desenvolvimento Pessoal | calendário/mapa | Hoje, Mapa, Relatório, três seletores | campos dos filtros e páginas de detalhe |
| Saúde | landing | cartões Consultas, Vacinas, Terapêuticas, Feridas, Informação geral | conteúdo de informação geral |
| Consultas | calendário/lista | Nova consulta, Relatório, Hoje/Dia/Semana/Lista | detalhe/edição e colunas da lista |
| Vacinas | lista/gestão | Nova vacina, Voltar | detalhe e atribuição a utentes |
| Terapêuticas | lista | pesquisa de utente, vista por medicamento, Voltar | prescrição, administração e histórico |
| Feridas | lista/gestão | Nova ferida, Voltar | detalhe, tratamentos e histórico |
| Estatísticas | catálogo | cartões de indicadores operacionais/demográficos | filtros, gráficos, exportação e drill-down |
| Mensalidades | lista | pesquisa, Produtos, Evolução Mensal, Relatório, Exportar | colunas, detalhe, estados financeiros |
| Funcionários | lista | pesquisa, Novo, Relatório, Perfis, Acessos, Funções, PINs | colunas, detalhe, edição |
| Candidaturas | lista | pesquisa, Adicionar, Critérios, Histórico | colunas, estados e decisão |
| Administração | formulário/resumo | dados da organização e área de faturação/subscrição | edição, validações, permissões |

## Estruturas transversais

- **OBSERVADO:** landing pages por cartões, listas pesquisáveis, calendário, modais simples, relatórios e filtros contextuais.
- **NÃO CONFIRMADO:** paginação, ordenação, seleção em massa, ações por linha, drawers, diálogos de confirmação, loading, erros, sucesso, notificações, auditoria visível e impressão.
- **Responsive:** NÃO CONFIRMADO; foi mantida a janela do utilizador sem alteração de viewport.

## Páginas não analisadas por privacidade/segurança

- Qualquer detalhe de utente, funcionário, familiar, candidatura, mensalidade ou registo clínico real.
- Resultados de relatórios, exportações e impressão.
- Ecrãs que exigissem alterar estado, marcar terapêutica, registar cuidado ou submeter dados.
- Registo Diário como página autónoma, porque a entrada visível não abriu uma rota nesta sessão.
