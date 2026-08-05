# CareLux Frontend Instructions

## Scope

These instructions apply to all frontend code under `src/`, including:

- `src/app`
- `src/components`
- `src/modules`
- `src/hooks`
- frontend utilities, layouts, pages and styles

They supplement the root `AGENTS.md`. In case of conflict, the most specific instruction applicable to the edited file must be followed.

Although this file is discovered for every file under `src/`, visual, component and responsive rules apply specifically when editing user-facing frontend code. Security, validation, authorization and tenant-isolation rules apply to the relevant server-side code under `src`. Do not force purely server-side files to follow irrelevant UI conventions.

## Visual source of truth

The mobile CareLuxe/Whacka application analysed for this project is the single visual source of truth for CareLux.

All frontend work must preserve its visual language, including:

- typography;
- colour palette;
- spacing rhythm;
- border radii;
- borders;
- shadows;
- icon style;
- card appearance;
- button appearance;
- form controls;
- navigation;
- hierarchy;
- interaction states;
- density and visual tone.

Do not redesign the application or introduce an unrelated visual language.

MySenior is a functional and structural reference only. It must never be used as a visual reference for CareLux.

## Responsive behaviour

The mobile CareLuxe/Whacka design is the reference implementation.

Tablet and desktop versions may change only:

- component distribution;
- column count;
- available width;
- navigation placement;
- information density;
- use of available screen space.

They must not change:

- typography;
- colours;
- component identity;
- iconography;
- radii;
- shadows;
- visual hierarchy;
- design tokens;
- overall brand language.

Responsive adaptation is allowed. Device-specific redesign is not allowed.

## Design tokens

Always reuse the existing CareLux tokens, CSS variables and utility classes before adding new values.

Known foundational values include:

- warm background based on `#F4EFE6`;
- primary green based on `#2A9D8F`;
- secondary warm tone based on `#BA9C72`;
- main text based on `#2D2A26`;
- muted text based on `#8B7D6B`;
- Inter for interface text;
- DM Serif Display for appropriate display headings;
- warm cards with subtle borders, soft shadows and approximately 16 px radii.

The values listed above document the current visual direction. The actual tokens and definitions in `src/app/globals.css` are authoritative. If this document and the implemented tokens ever differ, inspect the design reference and update the documentation rather than introducing parallel values.

Do not hardcode duplicate colours, shadows or radii when an existing token or class is available.

Before introducing a new token, inspect:

- `src/app/globals.css`;
- existing layouts;
- `src/components/carelux-ui`;
- existing CareLux components.

## Component policy

Before creating a component:

1. Search for an existing CareLux component.
2. Prefer composition or extension over duplication.
3. Reuse components from `src/components/carelux-ui`.
4. Keep shared visual primitives independent from domain-specific modules.
5. Preserve accessibility, keyboard interaction, focus management and semantic HTML.

Shared frontend primitives should normally live under:

`src/components/carelux-ui`

Domain-specific components should remain inside their corresponding module.

Do not create parallel implementations of Button, Dialog, Input, Card or similar primitives without confirming that no equivalent exists.

## shadcn policy

The `shadcn` CLI may be used as an implementation accelerator, but shadcn is not the visual source of truth.

Before adding a shadcn component:

1. Inspect the existing CareLux component primitives.
2. Confirm that the component is actually required.
3. Prefer the Base UI implementation when it is consistent with the existing project architecture.
4. Review the generated source code.
5. Adapt it to CareLux tokens, classes and interaction patterns.
6. Remove default shadcn visual styling that conflicts with CareLuxe/Whacka.
7. Avoid creating a competing generic `components/ui` design system unless explicitly approved.
8. Prefer integrating or wrapping the component under `src/components/carelux-ui`.

Never paste an unmodified shadcn component and assume its default design is acceptable.

The final component must look and behave as part of CareLux, not as a default shadcn interface.

## Forms

All new or substantially modified forms must use:

- React Hook Form;
- Zod;
- `@hookform/resolvers/zod`;
- typed schemas;
- accessible labels;
- field-level validation messages;
- appropriate loading, disabled, success and error states.

Avoid independent `useState` values for each form field when React Hook Form is appropriate.

Schemas should be reusable between the client interface and server-side validation whenever practical.

Do not trust client-side validation alone. Server actions and API handlers must validate submitted data again.

## Avatars and photographs

The initial CareLux version must not import or display real photographs of residents, relatives, employees, collaborators or administrators.

Use automatic generic avatars:

- masculine avatar for `MALE`;
- feminine avatar for `FEMALE`;
- neutral avatar for `OTHER` or undefined gender;
- initials as a complementary identifier.

Do not add photo upload controls unless this product decision is explicitly changed.

## Icons

Reuse the existing icon library and CareLux icon treatment.

Prefer `lucide-react` unless an existing component already uses another approved icon.

Icons must preserve the stroke-based, soft and restrained CareLux appearance.

Do not mix unrelated icon sets or use emoji as interface icons.

## Accessibility

All interactive frontend work must include:

- keyboard support;
- visible focus states;
- semantic elements;
- accessible names;
- adequate target sizes;
- correct disabled states;
- modal focus management;
- appropriate contrast.

Do not remove accessibility behaviour provided by Base UI or another headless primitive.

## Implementation discipline

For every frontend task:

1. Inspect the relevant Whacka/CareLuxe reference material.
2. Inspect the existing CareLux tokens and components.
3. State which existing visual patterns are being reused.
4. Implement the smallest coherent change.
5. Test mobile, tablet and desktop behaviour.
6. Run TypeScript and the production build.
7. Present changed files and the complete diff.
8. Do not commit unless explicitly requested.

If the relevant Whacka/CareLuxe reference material is not available in the current task context, do not invent a new visual pattern. Reuse the closest existing CareLux pattern and explicitly report that the reference material was unavailable.

Do not modify unrelated frontend areas while completing a scoped task.

## Mandatory checks

For meaningful frontend changes, run:

- `pnpm exec tsc --noEmit`;
- `pnpm run build`;
- the relevant lint command when the existing lint baseline allows it.

Also inspect the result at representative mobile, tablet and desktop widths.

## Prohibited behaviour

Do not:

- redesign the app;
- substitute the CareLux system with default shadcn styling;
- use MySenior as a visual reference;
- create device-specific visual languages;
- duplicate design tokens;
- introduce random colours, radii or shadows;
- create generic components without inspecting existing primitives;
- weaken accessibility;
- remove tenant, role or facility boundaries from frontend flows;
- expose administrative controls based only on client-side checks;
- alter the established Zod and React Hook Form policy.
