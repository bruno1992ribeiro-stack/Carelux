# CareLux — Repository Instructions

## Project

CareLux is a multi-tenant SaaS for senior-care facilities.

Primary stack:
- Next.js
- TypeScript
- Prisma/PostgreSQL
- Auth.js
- Zod
- React Hook Form

Preserve the existing CareLux design system and architecture.

## Working principles

Before modifying code:
1. Inspect the relevant existing implementation.
2. Reuse existing patterns where appropriate.
3. Keep changes scoped to the requested task.
4. Do not redesign unrelated areas.

Do not invent fields, permissions, models, or business rules without explicit justification.

## Git safety

- Never use `git add .` or `git add -A` for controlled commits.
- Never force push.
- Never reset, rebase, merge, or delete branches unless explicitly requested.
- Do not change the default branch without explicit authorization.
- Keep commits focused and run relevant validation before committing.
- Do not commit or push unless explicitly requested.

## Database safety

Never execute without explicit authorization:
- `prisma migrate deploy`
- `prisma migrate dev`
- `prisma migrate reset`
- `prisma db push`
- seeds
- `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, or `DROP` against test or development databases

Never automatically drop a database.

Protected databases must not be written unless explicitly authorized:
- `carelux_dev`
- `carelux_shadow`
- `carelux_migration_test`
- `carelux_install_test`
- `carelux_runtime_test`
- any remote database

Disposable databases may only be written when explicitly named and authorized.

Never print `POSTGRES_PASSWORD`, `DATABASE_URL`, `SHADOW_DATABASE_URL`, tokens, or secrets. Do not modify `.env` or `.env.local` without explicit authorization.

## Multi-tenant authorization

Tenant isolation is mandatory. Authorization must start from persisted user/client/facility permissions and tenant scope.

Reuse `getCurrentClientUser()`, `getFacilityReadScopeForUser()`, `requirePermission()`, `hasPermission()`, `requireResidentPermission()`, or their current equivalents.

Do not implement authorization based on hardcoded `Role.code` checks. Persisted `RolePermission` is the source of authorization.

A user may only access a Resident belonging to the Client/Facility scope they are authorized to access. Never trust a `residentId` received from the browser by itself.

## Prisma architecture

Prefer:

`component/page -> server action or loader -> service -> repository -> Prisma`

- Do not put Prisma queries directly in client components.
- Repositories should encapsulate tenant filters.
- Server actions must repeat authorization and Zod validation even when the client already validated the form.

## Forms

- Use Zod, React Hook Form, and `zodResolver`.
- Reuse existing CareLux form primitives and `ActionState` patterns.
- Prevent duplicate submission using `isSubmitting` or the existing equivalent.

## Resident safety

Residents must never be hard deleted. Use the existing archive strategy.

## Clinical data

Current clinical models:
- `ResidentDiagnosis`
- `ResidentAllergy`
- `ResidentClinicalRecord`

Permissions:
- clinical read: `VIEW_CLINICAL_RECORD`
- diagnosis mutation: `EDIT_PATHOLOGY`
- allergy mutation: `EDIT_ALLERGY`
- clinical-record mutation: `EDIT_CLINICAL_RECORD`

No runtime `Role.code` fallback is allowed.

## Clinical tenant rules

Every clinical operation must authorize the Resident first using the Resident's current tenant/facility scope. Only after authorization may clinical records for that Resident be queried.

`ResidentClinicalRecord.facilityId` is historical provenance, not the read authorization boundary.

For clinical-history reads:
- authorize the Resident using the Resident's current Facility;
- then load that Resident's relevant historical clinical records;
- do not require `clinicalRecord.facilityId === current user facility`.

When creating a `ResidentClinicalRecord`, derive `facilityId` server-side from the Resident's current Facility. Never accept an arbitrary `facilityId` from the browser.

## Clinical authorship

Always derive server-side:
- `createdById`
- `authorUserId`
- `deactivatedById`
- `voidedById`
- `facilityId`

Never trust those values from browser input.

## Clinical immutability

No clinical hard deletes. Never add `delete` or `deleteMany` flows for `ResidentDiagnosis`, `ResidentAllergy`, or `ResidentClinicalRecord`.

Diagnosis correction:
- create a new `ResidentDiagnosis`;
- point `supersedesId` to the previous diagnosis;
- automatically mark the previous diagnosis `INACTIVE`;
- set `deactivatedAt` and `deactivatedById`;
- perform related changes transactionally.

Creating an unrelated diagnosis does not deactivate other diagnoses.

Allergy correction:
- create a new `ResidentAllergy`;
- point `supersedesId` to the previous allergy;
- automatically mark the previous allergy `INACTIVE`;
- set `deactivatedAt` and `deactivatedById`;
- perform related changes transactionally.

Creating an unrelated allergy does not deactivate other allergies.

Clinical-record amendment:
- create a new `ResidentClinicalRecord`;
- use `amendsRecordId`;
- do not automatically void the original record;
- preserve original content.

Clinical-record void:
- set status to `VOIDED`;
- set `voidedAt` and `voidedById`;
- require a non-empty `voidReason` at application level;
- never delete the original record.

## Clinical UI

Resident Workspace tabs will evolve toward:
- Resumo
- Registos
- Saúde
- Consultas
- Medicação

Consultas and Medication are out of scope unless explicitly requested.

For Saúde:
- hide the navigation tab when the user lacks `VIEW_CLINICAL_RECORD`;
- still enforce `VIEW_CLINICAL_RECORD` server-side on the route;
- never treat hidden UI as authorization.

Current clinical alerts are only active allergies with `SEVERE` or `LIFE_THREATENING` severity. Do not infer diagnosis priority because the current model has no priority field.

For author display, use `User.fullName`. `Role.name` may be secondary “função”; never label it as a clinical profession.

Never communicate severity using color alone. Preserve usable touch targets and responsive mobile/tablet/desktop behavior.

## Scope

- Do not create Appointment or Medication schema/models unless explicitly requested.
- Do not create a central audit subsystem as part of the current clinical workspace.
- The append-only correction/void model is sufficient for the current clinical phase.

## Validation before commit

For relevant changes run:
- `prisma validate` when the Prisma schema is touched;
- `prisma generate` when needed;
- TypeScript with `--noEmit`;
- directed ESLint;
- `git diff --check`;
- appropriate tests/build.

Database tests require explicit authorization before writing.

## Failure behavior

When a validation or protected operation fails:
- stop;
- report the non-sensitive error;
- do not automatically reset, repair, drop, or retry destructive operations.
