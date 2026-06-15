# EMS Payroll — AI Agent Instructions

Read ALL of the following before writing any code:

## Skills (how the system is built)
- .claude/skills/laravel-backend.md
- .claude/skills/nextjs-frontend.md
- .claude/skills/ui-design.md
- .claude/skills/architecture.md
- .claude/skills/database.md
- .claude/skills/authentication.md
- .claude/skills/authorization.md
- .claude/skills/payroll-module.md
- .claude/skills/employee-module.md
- .claude/skills/testing.md
- .claude/skills/error-handling.md

## Rules (non-negotiable constraints)
- .claude/rules/naming.md
- .claude/rules/coding-style.md
- .claude/rules/folder-rules.md
- .claude/rules/security.md
- .claude/rules/api-design.md

## Templates (copy-paste starting points)
- .claude/templates/create-module.md
- .claude/templates/create-crud.md
- .claude/templates/create-api.md
- .claude/templates/create-frontend-page.md

## Memory (decisions & known quirks)
- .claude/memory/decisions.md
- .claude/memory/known-issues.md

## Global project rules
- CRUD first — no approval engines, AI, or schedulers unless asked
- Always generate: migration + model + factory + seeder + request + resource + controller + service + test
- Backend is API-only (Laravel 12, no Blade except payslip PDF)
- Frontend uses App Router — never Pages Router
- Color theme: **Blue + Yellow** with glass effect (see ui-design.md)
- Bearer token auth — no cookie/session/CSRF on API routes
- All API routes start with `/api/`
- Super-admin bypasses all permissions via Gate::before
