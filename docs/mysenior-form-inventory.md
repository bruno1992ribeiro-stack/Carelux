# Inventário de formulários

Nenhum formulário foi preenchido ou submetido. A indicação “obrigatório” reflete apenas sinalização visível; ausência de marcação HTML não prova opcionalidade.

## Novo Utente

**OBSERVADO** em `#/seniors/add`:

| Campo/grupo | Tipo/limite observado | Estado |
|---|---|---|
| Nome | texto, 100 | obrigatório visível — **OBSERVADO** |
| Nome de apresentação | texto, 20 | obrigatório visível — **OBSERVADO** |
| Data de nascimento | data | **NÃO CONFIRMADO** |
| Data de comemoração diferente | controlo visível para ativar uma data distinta; tipo técnico **NÃO CONFIRMADO** | opcionalidade aparente — **INFERIDO** |
| Género | seleção: Masculino/Feminino | **NÃO CONFIRMADO** |
| Altura | texto/medida em cm | **NÃO CONFIRMADO** |
| Nacionalidade | texto | **NÃO CONFIRMADO** |
| Estado civil | seleção: casado, divorciado, solteiro, viúvo | **NÃO CONFIRMADO** |
| Escolaridade | seleção de níveis de literacia/ensino | **NÃO CONFIRMADO** |
| Profissão | texto, 100 | **NÃO CONFIRMADO** |
| Comentários | textarea, 8000 | opcionalidade aparente — **INFERIDO** |
| Resposta social | seleção/autocomplete aparente | relação com unidade/resposta — **INFERIDO** |
| Nº processo | texto, 10 | **NÃO CONFIRMADO** |
| Data de admissão | data | **NÃO CONFIRMADO** |
| Quarto | texto, 30 | relação de alojamento aparente — **INFERIDO** |
| Morada | texto, 100 | dado sensível — **OBSERVADO** |
| Código postal | texto, 50 | dado sensível — **OBSERVADO** |
| Email | texto, 256 | dado sensível — **OBSERVADO** |
| Telefone | texto, 30 | dado sensível — **OBSERVADO** |

Botões: Voltar e Gravar. **INFERIDO:** a data de comemoração depende da alternância; resposta social condiciona contexto operacional. Risco de duplicação não pôde ser testado.

## Modais de configuração observados

- Novo Grupo AVD: Nome (texto, 30), Fechar, Gravar.
- Novo Funcionário: Nome (texto, 30), Fechar, Gravar. **NÃO CONFIRMADO:** este modal pode criar apenas um registo inicial antes de um detalhe mais completo.
- Nova Candidatura: Nome (texto, 30), Fechar, Gravar. **NÃO CONFIRMADO:** etapas adicionais após criação.
- Nova Consulta: Nome (texto, 30), Tipo (`Externa`/`Interna`), Fechar, Gravar. **NÃO CONFIRMADO:** pode corresponder a um catálogo/tipo e não a uma consulta individual.
- Nova Vacina: Nome (texto, 30), Fechar, Gravar. **NÃO CONFIRMADO:** pode corresponder a um catálogo/tipo e não a um ato de vacinação individual.
- Nova Ferida: Nome (texto, 30), Fechar, Gravar. **NÃO CONFIRMADO:** pode corresponder a um catálogo/tipo e não a um registo clínico individual.

## REQUISITOS CARELUX para implementação futura

- React Hook Form + Zod, TypeScript estrito e trim antes de validar e submeter — **REQUISITO CARELUX**.
- Validação no cliente e no servidor; rejeitar whitespace; campos obrigatórios acessíveis — **REQUISITO CARELUX**.
- `aria-describedby` para erros, labels associados e targets mínimos de 44×44 px — **REQUISITO CARELUX**.
- Botão desativado com formulário inválido e imediatamente após submissão — **REQUISITO CARELUX**.
- Estados de loading, sucesso e erro; idempotência, prevenção de submissões duplicadas e controlo de duplicados no servidor — **REQUISITO CARELUX**.
- Validação de `clientId` e `facilityId` em todas as relações; proteção reforçada para contacto, finanças e saúde — **REQUISITO CARELUX**.
