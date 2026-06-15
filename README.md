# Employee Management & Payroll System

A full-stack web application for managing employees, departments, attendance, leave requests, and payroll — built with a modern Next.js frontend and a Laravel REST API backend.

## Tech Stack

**Backend**
- Laravel 12 / PHP 8.5
- MySQL 8.0
- Laravel Sanctum (Bearer token auth)
- Spatie Laravel Permission (role-based access control)
- Pest (28 tests)

**Frontend**
- Next.js 16 (App Router) / React 19
- TypeScript (strict mode)
- Tailwind CSS v4
- TanStack Query v5
- Zustand
- React Hook Form + Zod

## Features

- **Authentication** — login, token-based session management, protected routes
- **Role-based access control** — `super-admin`, `hr-manager`, `employee` roles; super-admin bypasses all permission checks
- **Employee management** — employee profiles, department & position assignments, status tracking (active / inactive / terminated)
- **Departments & Positions** — full CRUD with employee counts
- **Attendance** — attendance record management and tracking
- **Leave management** — leave types and leave request workflows
- **Payroll** — payroll periods, payroll generation, allowances, deductions, and payslip PDF export
- **Employee self-service portal** — employees can view their own record at `/me/employee`

## Design

Dark glass-morphism UI with a blue + yellow color scheme (`#0a1628` → `#1e3a8a` gradient background, frosted-glass cards).

## Project Structure

```
employee-management-payroll/
├── backend/      # Laravel 12 API
└── frontend/     # Next.js 16 App
```

## Getting Started

### Prerequisites

- PHP 8.5+
- Composer
- Node.js 20+
- MySQL 8.0

### Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Configure your database in `.env`, then run:

```bash
php artisan migrate --seed
php artisan serve
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
```

Set `NEXT_PUBLIC_API_URL` in `.env.local` to point to your Laravel backend, then run:

```bash
npm run dev
```

## Default Credentials

| Role | Email | Password |
|---|---|---|
| Super Admin | admin@example.com | password |
| Employee | employee@example.com | password |

## API Overview

All endpoints are prefixed with `/api/` and require a Bearer token (except `/api/auth/login`).

| Resource | Base URL |
|---|---|
| Auth | `/api/auth/login` |
| Employees | `/api/employees` |
| Departments | `/api/departments` |
| Positions | `/api/positions` |
| Attendance | `/api/attendance` |
| Leave | `/api/leave-requests` |
| Payroll | `/api/payrolls` |
| Payslips | `/api/payslips` |
| Self-service | `/api/me/employee` |
