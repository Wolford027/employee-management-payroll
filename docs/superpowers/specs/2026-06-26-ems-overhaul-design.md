# EMS Payroll — Full Overhaul Design Spec
**Date:** 2026-06-26  
**Approach:** Tenancy-first sequential (A)  
**Stack:** Laravel 12 backend · Next.js 16 frontend · MySQL · Row-level multi-tenancy

---

## Overview

Five sub-projects executed in dependency order:

1. Multi-Tenancy Foundation
2. Attendance Clock-In/Out (Camera + Geolocation)
3. Philippine Payroll Deduction Engine
4. Bulk PDF Payslip Export
5. UI Overhaul

Each sub-project is built on top of the previous. Multi-tenancy comes first because every domain table gains `tenant_id` — all subsequent features must be built on the tenanted schema.

---

## Sub-Project 1: Multi-Tenancy Foundation

### Database schema

New `tenants` table:

```
id | name | slug (unique) | status | timestamps
```

Every domain table gets a `tenant_id` foreign key in fresh migrations (clean slate — all existing migrations are rewritten from scratch with `tenant_id` included from the start):

- `users`, `employees`, `departments`, `positions`
- `attendance_records`, `leave_types`, `leave_requests`
- `allowances`, `deductions`, `payroll_periods`, `payrolls`, `payroll_items`, `payslips`
- `audit_logs`

`users.tenant_id` is nullable (super-admin only). All other tables: `tenant_id` non-nullable.

`users` also gets:
- `is_owner` boolean (owner of the tenant)

### Eloquent global scope

A `BelongsToTenant` trait auto-injects `WHERE tenant_id = auth()->user()->tenant_id` on every query and auto-sets `tenant_id` on create. Applied to all domain models. Super-admin bypasses via `Gate::before` (already in `AppServiceProvider`).

### Auth & user hierarchy

- **Registration** (`POST /api/auth/register`): creates a `tenant` row, then a `user` with `is_owner = true` and role `hr-manager`. This is the only place a tenant is created.
- **Team member invite** (new `POST /api/team-members`): Owner/HR creates a user by filling name + email + role. System creates the user with `tenant_id` of the creator, `force_password_change = true`, default password `12345678`. No email sent.
- **Employee account creation**: When HR creates an employee and ticks "Create login account," a user is created the same way and linked via `employee.user_id`.

### Frontend additions

- New `/settings/team` page: lists all users in the tenant, "Invite Member" button opens a dialog (name, email, role dropdown).
- Registration page updated: after successful register, user lands on a tenant-setup screen (company name) before the dashboard.

### Tenant isolation contract

- Super-admin (`tenant_id = null`) bypasses tenant scope via existing `Gate::before`.
- All other users are scoped to their `tenant_id` — they cannot read or write another tenant's rows.
- API responses never leak cross-tenant data — enforced at the Eloquent scope level, not the controller level.

---

## Sub-Project 2: Attendance Clock-In/Out (Camera + Geolocation)

### Employee portal clock flow

`/portal` gets a "Today's Attendance" card with three states:

| State | Display |
|---|---|
| Not clocked in | "Clock In" button (electric blue neon) |
| Clocked in | Live elapsed timer + "Clock Out" button (gold neon) |
| Completed | Time-in, time-out, hours worked, photo thumbnail, map thumbnail |

Clock In / Clock Out opens a confirmation modal that simultaneously:
1. Activates device camera (`getUserMedia`) → captures a still JPEG frame
2. Calls `navigator.geolocation.getCurrentPosition()` → lat/lng
3. POSTs to `POST /api/attendance/clock`

### Backend clock endpoint

New `AttendanceClockController@clock` (separate from existing `AttendanceController`):

```
POST /api/attendance/clock
Body: { action: "in"|"out", photo: base64string, lat: float, lng: float }
```

- `in`: creates/finds today's `attendance_record` for the authed employee, sets `time_in`, stores photo to `storage/app/private/attendance-photos/{tenant_id}/{date}/{employee_id}_in.jpg`, sets `lat_in`, `lng_in`.
- `out`: updates the record with `time_out`, computes `hours_worked`, stores `photo_out`, sets `lat_out`, `lng_out`.

Photo served via `GET /api/attendance/{id}/photo/{direction}` (streams private file, requires auth).

### Database additions (new migration)

Added to `attendance_records`:

```
photo_in   string nullable
photo_out  string nullable
lat_in     decimal(10,7) nullable
lng_in     decimal(10,7) nullable
lat_out    decimal(10,7) nullable
lng_out    decimal(10,7) nullable
```

### Admin manual override

Existing `/attendance` CRUD page is unchanged. HR can still add/edit any attendance record manually. The `clock` endpoint is for the employee self-service flow only.

### Static map display

When lat/lng is present, display:
```html
<img src="https://staticmap.openstreetmap.de/staticmap.php?center={lat},{lng}&zoom=15&size=300x150&markers={lat},{lng}" />
```
No API key required. Shown as a small thumbnail in the attendance detail view.

---

## Sub-Project 3: Philippine Payroll Deduction Engine

### New `payroll_settings` table

One row per tenant (SSS uses bracket lookup — no rate column needed):

```
id | tenant_id | philhealth_rate | pagibig_employee_rate | pagibig_employer_rate | tax_table | timestamps
```

- `philhealth_rate`: default `0.05` (5% per PHIC 2024, split 50/50)
- `pagibig_employee_rate`: default `0.02`, `pagibig_employer_rate`: default `0.02`, each capped at ₱100/month
- `tax_table`: enum `train_law_2023` (only option for now)

SSS contribution brackets are hardcoded in a `SssTable` PHP class matching the official 2024 schedule — not stored in the database.

### Computation flow (updated `PayrollService::generate`)

For each employee per pay period:

1. `basic` = annual salary ÷ cycle divisor (unchanged)
2. **SSS**: look up `SssTable::lookup($basic)` → `employee_share`, `employer_share`
3. **PhilHealth**: `basic × philhealth_rate / 2`, capped at ₱1,800 per side
4. **Pag-IBIG**: `basic × pagibig_employee_rate`, capped at ₱100
5. **BIR withholding tax**: annualize basic, look up TRAIN Law 2023 bracket, de-annualize
6. Store each as a `payroll_item` with `type = "deduction"` and labels `"SSS"`, `"PhilHealth"`, `"Pag-IBIG"`, `"Withholding Tax"`
7. `net_pay = gross_pay − sum(employee-side deductions)`

### Admin settings page `/settings/payroll`

Owner/HR only. Shows:
- PhilHealth rate (editable, default 5%, note: "Matches current PHIC schedule")
- Pag-IBIG rates (editable, default 2%/2%, note: "Capped at ₱100/month per side")
- SSS bracket table (view-only, shows current schedule with effective date)
- Tax table selector (dropdown, only `TRAIN Law 2023` available now)
- "Reset to PH Defaults" button

### Backward compatibility

Existing `allowances` and `deductions` tables remain for custom flat items (bonuses, cash advances). PH statutory deductions are computed separately and stored as `payroll_items` — they do not go through the `allowances`/`deductions` tables.

---

## Sub-Project 4: Bulk PDF Payslip Export

### Export modes

Both triggered from the payroll period detail page (`/payroll/periods/{id}`) via "Export All" split-button:

- **ZIP**: one PDF per employee bundled into `payslips-{period-name}-{date}.zip`
- **Merged PDF**: all payslips concatenated into `payslips-{period-name}-{date}.pdf`

### Backend endpoint

```
POST /api/payroll-periods/{id}/payslips/export
Body: { format: "zip" | "merged" }
```

- Finds all finalized payrolls for the period
- For each, generates (or reuses cached) the individual payslip PDF via existing `PayslipService`
- **ZIP**: uses PHP `ZipArchive` to bundle in memory, streams as download
- **Merged**: uses `setasign/fpdi` to concatenate PDFs, streams result
- Synchronous — no queue. Suitable for up to ~100 employees.

### Frontend

Split-button "Export All" at the top of the period detail page:

```
[ Export All ▾ ]
  → Download ZIP
  → Download Merged PDF
```

Both use `fetch` with `responseType: blob` + programmatic `<a>` click. Toast shows "Preparing export…" while in flight.

### Payslip template update

The existing Blade template (`resources/views/payslips/`) is updated to include PH deduction line items (SSS, PhilHealth, Pag-IBIG, Withholding Tax) from `payroll_items`, replacing the previous generic deductions column.

---

## Sub-Project 5: UI Overhaul

### Design token changes

New/updated CSS variables in `globals.css`:

```css
--electric-blue: #00aaff;      /* replaces #3b82f6 as primary accent */
--gold: #ffd700;               /* replaces #eab308 as secondary accent */
--neon-glow-blue: 0 0 12px rgba(0, 170, 255, 0.45);
--neon-glow-yellow: 0 0 12px rgba(255, 215, 0, 0.4);
```

### New CSS utilities

```css
.neon-border-blue  { border: 1px solid rgba(0,170,255,0.4); box-shadow: var(--neon-glow-blue); }
.neon-border-yellow { border: 1px solid rgba(255,215,0,0.35); box-shadow: var(--neon-glow-yellow); }
.glow-text-blue    { text-shadow: 0 0 20px rgba(0,170,255,0.6); }
@keyframes pulse-glow { 0%,100% { opacity:1; } 50% { opacity:0.65; } }
@keyframes fadeSlideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
```

### Landing page (`app/page.tsx`) — full rebuild

- **Hero**: CSS-only animated gradient mesh background, headline with shimmer effect on brand gradient text, floating card mockups of the dashboard
- **Stats band**: animated count-up counters triggered by `IntersectionObserver`
- **Features**: cards with neon-glow icon rings, hover lift + glow
- **Pricing**: "Popular" badge with pulsing glow
- **CTA band**: deep blue gradient with pulsing gold accent line

### Internal app

| Element | Change |
|---|---|
| Sidebar active item | Neon blue left-border bar + `box-shadow: var(--neon-glow-blue)` |
| Dashboard stat cards | Neon-glow icon ring, animated count-up on mount |
| Tables | Alternating row tint, hover row blue glow |
| Primary button | Neon blue glow on hover |
| Destructive button | Red glow on hover |
| Dialogs/modals | `glass-strong` + neon border |
| All interactive elements | `transition: all 0.2s ease` |
| Page `<main>` | `animation: fadeSlideUp 0.3s ease` on mount |
| Mobile nav | Bottom sheet drawer replaces top-bar header |

---

## Execution Order (Summary)

| # | Sub-project | Depends on |
|---|---|---|
| 1 | Multi-Tenancy Foundation | — |
| 2 | Attendance Clock-In/Out | #1 (tenant_id on attendance_records) |
| 3 | Philippine Payroll Engine | #1 (tenant_id on payroll tables + payroll_settings) |
| 4 | Bulk PDF Export | #3 (payslip template update needed) |
| 5 | UI Overhaul | Can start in parallel with #2–4 on frontend only |

---

## Out of Scope

- Email invite system (deferred — owner creates accounts directly)
- Queue/background jobs for PDF generation (synchronous is fine up to ~100 employees)
- Native mobile app (web-responsive only)
- Multi-language / i18n
- AI features, approval workflows, or schedulers
