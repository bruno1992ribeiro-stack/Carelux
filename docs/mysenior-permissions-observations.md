# Observações de permissões

## Permissões diretamente observadas no MySenior

- Funcionários expõe ações separadas para `Alterar Perfis`, `Gerir Acessos` e `Gerir Funções` — **OBSERVADO**.
- Existe a ação `Mostrar PINs` — **OBSERVADO** e altamente sensível. Não foi aberta e a sua implementação interna é **NÃO CONFIRMADA**.
- Administração e dados de subscrição/faturação estavam visíveis nesta sessão — **OBSERVADO**; o perfil e o âmbito que concederam o acesso são **NÃO CONFIRMADOS**.
- Registo Diário estava no menu, mas não abriu página — **NÃO CONFIRMADO**.
- Não foram observadas mensagens explícitas de acesso negado.

## Permissões já existentes no CareLux

Permissões já definidas: ver/criar/editar/arquivar/restaurar utente; registo clínico; patologia; medicação; consulta; documentos; funcionários; finanças; inventário; utilizadores; auditoria; exportação; família; mensagens.

Perfis já enumerados incluem administração, direção, medicina, enfermagem, terapias, psicologia, nutrição, serviço social, cuidados, receção, administrativo, família e auditor externo.

## Inferências ainda por validar

| Área | Ver | Criar/editar | Ações reforçadas |
|---|---|---|---|
| Utentes | pessoal autorizado | administração/equipa autorizada | âmbitos concretos **NÃO CONFIRMADOS** |
| Saúde/terapêutica | profissionais clínicos autorizados | função clínica específica | auditoria obrigatória e confirmação contextual |
| AVD/Registo Diário | equipa operacional autorizada | turno/unidade autorizados | autor, instante, correções auditadas |
| Desenvolvimento Pessoal | equipa técnica autorizada | responsáveis da atividade | presenças e alterações auditadas |
| Mensalidades | administração/financeiro | financeiro autorizado | exportação e alterações de valor auditadas |
| Funcionários | gestão autorizada | administração/RH | perfis, acessos, funções e PINs separados |
| Candidaturas | administração/direção | autorizados por unidade | histórico de decisão imutável |
| Estatísticas | conforme dados de origem | sem edição | agregação e minimização |
| Família | acesso relacionado com o utente associado — **INFERIDO** | âmbito de edição **NÃO CONFIRMADO** | encaminhamento de comunicações **NÃO CONFIRMADO** |

## REQUISITOS CARELUX

- Arquivar utentes em vez de os eliminar permanentemente — **REQUISITO CARELUX**.
- A conta de família pode visualizar apenas o utente explicitamente associado à sua conta — **REQUISITO CARELUX**.
- O perfil de família é read-only — **REQUISITO CARELUX**.
- Mensagens da família são encaminhadas para administradores autorizados — **REQUISITO CARELUX**.
- Alterações em saúde, finanças e operações exigem auditoria reforçada e histórico de correções — **REQUISITO CARELUX**.
- Todas as operações devem validar `clientId` e `facilityId` dentro do âmbito autorizado — **REQUISITO CARELUX**.

## Pontos para validação manual

- Escopo real de cada perfil por módulo, unidade e resposta social.
- Quem pode ver PINs e se estes podem ser substituídos por credenciais temporárias seguras.
- Permissões de relatório, impressão e exportação por domínio.
- Separação entre configurar catálogos e registar atos clínicos/operacionais.
- Regras de correção, anulação e tomada de conhecimento.
