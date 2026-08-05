# CareLux Frontend Design System

## 1. Fonte visual de verdade

A aplicação móvel de referência Whacka/CareLuxe é a única fonte visual de verdade. Como essa referência não está disponível nesta execução, este documento limita-se aos tokens e padrões CareLux já implementados. Nenhum padrão visual novo é inferido.

`src/app/globals.css` é a fonte técnica de verdade. Em caso de divergência, deve rever-se a referência visual e atualizar a documentação; não se criam valores paralelos.

## 2. Relação entre referências e shadcn

- Whacka/CareLuxe determina a direção visual.
- MySenior informa apenas estrutura e funcionalidade.
- shadcn fornece código-base técnico e acessível.
- Base UI fornece os primitives headless.
- A variante `base-luma` é uma fundação estrutural, não um tema visual do produto.
- Os wrappers CareLux aplicam a identidade pública usada pela aplicação.

## 3. Arquitetura de componentes

| Camada | Localização | Responsabilidade |
| --- | --- | --- |
| Primitives | `src/components/ui` | Código shadcn/Base UI sem lógica de negócio |
| Wrappers públicos | `src/components/carelux-ui` | Defaults, tokens e identidade CareLux |
| Domínio | `src/modules/*/components` | Comportamento e apresentação específicos do módulo |
| Páginas e layouts | `src/app` | Composição de fluxos e rotas |

Primitives não importam módulos. Componentes de domínio usam wrappers públicos, não primitives diretamente.

## 4. Regras de importação

Correto:

```tsx
import { Button, Field, Input } from "@/components/carelux-ui";
```

Permitido dentro de `src/components/carelux-ui`:

```tsx
import { Button as ButtonPrimitive } from "@/components/ui/button";
```

Proibido em páginas e módulos:

```tsx
import { Button } from "@/components/ui/button";
```

## 5. Tokens semânticos

Os tokens expostos ao Tailwind são `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `chart-*` e `sidebar-*`, com os respetivos tokens de foreground quando definidos.

Tokens adicionais CareLux: `--muted-light`, `--radius-card`, `--radius-sheet`, `--shadow-card`, `--shadow-primary`, `--navigation-background` e `--secondary-border`.

## 6. Paleta de cores

| Uso | Token | Valor claro atual |
| --- | --- | --- |
| Fundo | `--background` | `#f4efe6` |
| Texto principal | `--foreground` | `#2d2a26` |
| Card/popover | `--card`, `--popover` | `#faf6f0` |
| Primária | `--primary` | `#2a9d8f` |
| Texto sobre primária | `--primary-foreground` | `#ffffff` |
| Secundária | `--secondary` | `#ba9c72` |
| Muted | `--muted` | `#eee7dc` |
| Texto muted | `--muted-foreground` | `#8b7d6b` |
| Texto muted claro | `--muted-light` | `#b8a99a` |
| Accent | `--accent` | `#e4f2ef` |
| Border | `--border` | `rgba(232, 223, 209, 0.5)` |
| Input | `--input` | `rgba(255, 255, 255, 0.8)` |

O modo escuro tem tokens implementados, mas a sua correspondência final com a referência visual está **Por decidir**.

## 7. Tipografia

- Interface: Inter, através de `--font-inter` e `font-sans`.
- Display: DM Serif Display, peso 400, através de `--font-dm-serif-display`, `font-display` e `font-heading`.
- Título de página documentado: 24/32 px, peso 400.
- Título de secção: 14/20 px, peso 600.
- Corpo: 14/20 px.
- Small: 12/16 px.
- Tiny: 11/16,5 px.

DM Serif Display é reservado a títulos e identidade editorial apropriados; não substitui Inter nos controlos.

## 8. Espaçamento

A escala segue múltiplos de 4 px. Os padrões existentes usam frequentemente 4, 8, 12, 16, 20, 24 e 32 px. Uma tabela normativa completa de spacing está **Por decidir**.

## 9. Border radii

- Base/controlos: `--radius: 0.75rem` (12 px).
- Cards: `--radius-card: 1rem` (16 px).
- Bottom sheets: `--radius-sheet: 1.5rem` (24 px).
- Classes `rounded-*` derivadas pelo Tailwind devem continuar ligadas ao token base.

## 10. Bordas

Usar `border-border`. Cards usam uma borda subtil de `0.8px` via `card-warm`. Inputs usam o token `border` e foco com `ring`. Não duplicar valores hexadecimais quando existe token.

## 11. Sombras

- Card: `--shadow-card: 0 1px 2px rgba(0, 0, 0, 0.05)`.
- Ação primária: `--shadow-primary: 0 4px 12px rgba(42, 157, 143, 0.2)`.
- Sombras específicas adicionais não cobertas por estes tokens: **Por decidir**.

## 12. Iconografia

Lucide é a biblioteca aprovada. Usar ícones de traço, suaves e contidos, normalmente com `strokeWidth={1.8}` na navegação existente. Emoji não substitui ícones de interface. O tamanho normativo por contexto está **Por decidir**.

## 13. Estados de interação

- Hover: mudança subtil através de `primary/5`, `primary/10` ou `primary/90`, conforme o componente existente.
- Active/current: fundo `primary/10` e texto `primary` na navegação.
- Focus: outline visível de 3 px baseado em primária, com offset de 2 px; wrappers podem complementar com `ring`.
- Disabled: interação bloqueada, cursor apropriado e opacidade reduzida.
- Loading: botão imediatamente desativado e estado textual ou indicador acessível. O indicador visual partilhado está **Por decidir**.
- Destructive: usar `destructive`; o padrão completo de botão/alerta destrutivo está **Por decidir**.

## 14. Touch targets

Todos os elementos interativos têm mínimo de 44 × 44 px. A utility `interactive-target` é o padrão atual. Tamanhos shadcn inferiores não podem chegar diretamente à interface pública.

## 15. Mobile, tablet e desktop

Mobile é a referência. Tablet e desktop podem mudar distribuição, colunas, largura, densidade e posição da navegação, sem mudar identidade, tokens ou hierarquia.

Breakpoints observados:

- mobile/tablet: navegação inferior e painel “Mais”;
- desktop (`lg`): sidebar fixa e conteúdo com offset lateral;
- grids evoluem progressivamente com `sm`, `md` e `lg`.

Larguras normativas por dispositivo além dos breakpoints Tailwind usados estão **Por decidir**.

## 16. Navegação

- Mobile/tablet: barra inferior translúcida com blur, safe-area e cinco posições.
- Opções secundárias: bottom sheet modal com overlay preto a 40%, foco contido, Escape e reposição do foco.
- Desktop: sidebar `card-warm`, grupos semânticos, estado atual com `aria-current`.
- Não comunicar estado apenas pela cor; texto, posição e `aria-current` complementam-no.

## 17. Cards

O wrapper `Card` assenta no primitive shadcn e aplica `card-warm`: superfície quente, radius de 16 px, borda subtil e sombra leve. Usar a composição `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardAction` e `CardFooter`.

## 18. Buttons

O Button público usa primária, texto branco, radius de 12 px, sombra primária, texto 14 px semibold e target mínimo. O tipo por omissão é `button`. Variantes públicas adicionais estão **Por decidir** e não devem ser inferidas das variantes genéricas Luma.

## 19. Inputs e labels

Inputs públicos usam fundo branco a 80%, radius de 12 px, padding de 12 × 16 px, altura mínima de 44 px, texto Inter e estados acessíveis. Labels usam 14 px, peso 500 e associação explícita `htmlFor`/`id`.

## 20. Formulários React Hook Form + Zod

Formulários novos ou substancialmente modificados usam React Hook Form, Zod e `zodResolver`. O schema deve ser tipado e reutilizado no servidor quando praticável. Valores textuais são trimmed; o servidor volta a validar. Devem existir estados loading, disabled, success e error e prevenção de submissão duplicada.

## 21. Fields e validação

Usar `Field`, `FieldLabel`, `FieldDescription` e `FieldError`. O Field recebe `data-invalid`; o controlo recebe `aria-invalid`. Mensagens são pt-PT, específicas, ligadas ao campo e anunciadas com semântica acessível. Grupos relacionados usam `FieldSet` e `FieldLegend`.

## 22. Dialogs e overlays

O Dialog público mantém Base UI para gestão de foco e teclado. Usa overlay preto a 40%, painel `card-warm`, conteúdo scrollável, viewport responsivo, botão “Fechar” acessível e target mínimo. Deve existir sempre um `DialogTitle`, ainda que visualmente oculto.

## 23. Tabelas

Existem tabelas próprias no produto, mas ainda não há wrapper CareLux formal. Estrutura, densidade, comportamento mobile e estados de seleção estão **Por decidir**. Preservar semântica nativa de tabela quando os dados forem tabulares.

## 24. Feedback e notificações

Estados de erro existentes usam `role="alert"`. O projeto declara Sonner, mas o wrapper e a política de notificações ainda estão **Por decidir**. Não apresentar sucesso sem confirmação da operação nem ocultar erros de servidor.

## 25. Avatares genéricos

Não usar fotografias reais. Usar avatar masculino para `MALE`, feminino para `FEMALE`, neutro para `OTHER` ou género ausente, complementado por iniciais. A ilustração concreta dos avatares está **Por decidir**.

## 26. Acessibilidade

Exigir HTML semântico, nomes acessíveis, labels, foco visível, teclado, contraste legível, targets mínimos, disabled real, gestão de foco modal e respeito por `prefers-reduced-motion`. Não remover comportamento acessível fornecido por Base UI.

## 27. Regras para primitives shadcn

- Permanecem em `src/components/ui`.
- Usam Base UI, `base-luma`, Tailwind v4, CSS variables e Lucide.
- Não contêm lógica de negócio nem imports de módulos.
- Não são a API visual pública.
- Não se executa `init`, `apply`, `force`, `overwrite` ou `reinstall` sem autorização.
- Um primitive novo exige utilização comprovada e revisão do dry-run.

## 28. Regras para wrappers CareLux

- Permanecem em `src/components/carelux-ui`.
- São os únicos componentes autorizados a importar primitives pelo alias `@/components/ui/*`.
- Aplicam tokens e defaults CareLux, preservando props, refs e acessibilidade.
- Exportam uma API explícita através do barrel.
- Não contêm lógica específica de domínio.

## 29. Exemplos corretos

```tsx
<Field data-invalid={fieldState.invalid}>
  <FieldLabel htmlFor={field.name}>Nome</FieldLabel>
  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
</Field>
```

```tsx
<Card>
  <CardHeader>
    <CardTitle>Unidade</CardTitle>
  </CardHeader>
  <CardContent>…</CardContent>
</Card>
```

## 30. Exemplos proibidos

```tsx
// Página a importar o primitive diretamente.
import { Input } from "@/components/ui/input";
```

```tsx
// Valor visual duplicado quando existe token.
<div className="bg-[#FAF6F0] shadow-[0_1px_2px_rgba(0,0,0,0.05)]" />
```

```tsx
// Modal sem título, foco ou nome acessível.
<div className="fixed inset-0">…</div>
```

## 31. Decisões ainda pendentes

- correspondência final do modo escuro com a referência visual;
- escala normativa completa de spacing;
- tamanhos normativos de ícones por contexto;
- indicador partilhado de loading;
- variantes públicas adicionais de Button;
- padrão completo destructive;
- wrapper, densidade e responsive das tabelas;
- política e wrapper de notificações Sonner;
- ilustrações finais dos avatares genéricos;
- comportamento visual dos primitives ainda não integrados.
