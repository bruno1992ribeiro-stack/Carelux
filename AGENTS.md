# CareLux — Agent Instructions

## Project
CareLux is a senior-care management platform for residential care homes, day centres and home-care services.

- Product name: CareLux, never CareLuxe.
- User-facing language: Portuguese from Portugal (pt-PT).
- Preserve the existing architecture and naming conventions.
- Inspect the current implementation before creating new components, routes, models or APIs.
- Reuse existing components and utilities whenever possible.

## Decision-making and ambiguity

Never assume, infer, guess or silently choose a product, design, user-experience, workflow, business-rule, data-model, permission, security, migration or architectural decision that has not been explicitly defined by the user or by an authoritative CareLux project document.

Whenever information is missing, conflicting, ambiguous or allows more than one reasonable interpretation, stop before changing code and ask the user an explicit and focused question describing the decision required, the available options, the relevant trade-offs and the affected behaviour or files.

Do not treat silence, missing reference material, placeholder content or an existing accidental implementation as approval.

Rules explicitly established in the applicable `AGENTS.md`, the CareLux design-system documentation or the current user instruction are authoritative decisions and do not require reconfirmation.

## Technology
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Prisma with PostgreSQL
- NextAuth
- pnpm

Do not change dependencies, authentication configuration, environment variables, Prisma models or database migrations unless explicitly requested.

Never run destructive database commands.

## Design system

### Colours
- Page background: #F4EFE6
- Card background: #FAF6F0
- Primary: #2A9D8F
- Primary text: #2D2A26
- Muted text: #8B7D6B
- Light muted text: #B8A99A
- Border: rgba(232, 223, 209, 0.5)

### Typography
- Body font: Inter
- Display font: DM Serif Display
- Page title: 24px / 32px, weight 400
- Section title: 14px / 20px, weight 600
- Body: 14px / 20px
- Small: 12px / 16px
- Tiny: 11px / 16.5px

### Components
- Cards use #FAF6F0, 16px radius, subtle border and light shadow.
- Inputs use white at 80% opacity, 12px radius and 12px 16px padding.
- Primary buttons use #2A9D8F with white text.
- Bottom sheets use a 40% black overlay, #FAF6F0 panel and 24px top radius.
- Maintain consistent spacing based on multiples of 4px.

## Accessibility
- Interactive targets must be at least 44 × 44px.
- All keyboard-interactive elements need a clearly visible focus state.
- Use semantic HTML and accessible labels.
- Do not rely on colour alone to communicate status.
- Respect reduced-motion preferences.
- Maintain readable colour contrast.

## Forms and actions
- Trim text values before validation and submission.
- Required fields must be validated in the interface and on the server.
- Disable submission buttons while forms are invalid.
- Disable buttons immediately after submission.
- Show loading, success and error states.
- Prevent duplicate submissions on both client and server.
- Do not accept values containing only whitespace.

## Data and permissions
- Never expose data from one care facility to another without permission.
- Administrators have full access according to their scope.
- Employees may only access and edit authorised operational records.
- Family profiles are read-only for their own relative.
- Family communications must be routed to authorised administrators.
- Archive residents instead of permanently deleting them.
- Clinical, medication, shift and task changes require an audit trail.

## Privacy
- Do not include real resident or family information in fixtures, examples or screenshots.
- Use generic avatars instead of real photographs unless explicitly approved.
- Follow data-minimisation principles.

## Quality
Before completing a change:

1. Review the affected files and nearby patterns.
2. Run the relevant lint and TypeScript checks.
3. Test loading, empty, success, error and disabled states.
4. Check mobile and desktop layouts.
5. Summarise the files changed and any remaining risks.

Make focused changes. Do not refactor unrelated areas.

