<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /** Resource modules that get a standard CRUD permission set. */
    private const MODULES = [
        'employee', 'department', 'position', 'attendance',
        'leave', 'payroll', 'payslip', 'report', 'user',
    ];

    private const ACTIONS = ['viewAny', 'view', 'create', 'update', 'delete'];

    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        // 1. Permissions: "<action> <module>" e.g. "create employee".
        $permissions = [];
        foreach (self::MODULES as $module) {
            foreach (self::ACTIONS as $action) {
                $permissions[] = Permission::firstOrCreate([
                    'name' => "{$action} {$module}",
                    'guard_name' => 'web',
                ]);
            }
        }

        // Team-member permissions (separate from the standard CRUD set).
        $teamMemberPermissions = ['viewAny team-member', 'create team-member', 'delete team-member'];
        foreach ($teamMemberPermissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        // 2. Roles.
        $superAdmin = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
        $hr = Role::firstOrCreate(['name' => 'hr', 'guard_name' => 'web']);
        $manager = Role::firstOrCreate(['name' => 'manager', 'guard_name' => 'web']);
        $employee = Role::firstOrCreate(['name' => 'employee', 'guard_name' => 'web']);

        // Super Admin: every permission (also bypassed via Gate::before in AuthServiceProvider).
        $superAdmin->syncPermissions(Permission::all());

        // HR: full CRUD on everything except user administration + team-member management.
        $hr->syncPermissions(
            Permission::whereNot('name', 'like', '% user')->get()
        );
        $hr->givePermissionTo(['viewAny team-member', 'create team-member', 'delete team-member']);

        // Manager: read org data, manage attendance + leave, read payroll/reports, view team.
        $manager->syncPermissions([
            'viewAny employee', 'view employee',
            'viewAny department', 'view department',
            'viewAny position', 'view position',
            'viewAny attendance', 'view attendance', 'create attendance', 'update attendance', 'delete attendance',
            'viewAny leave', 'view leave', 'create leave', 'update leave', 'delete leave',
            'viewAny payroll', 'view payroll',
            'viewAny payslip', 'view payslip',
            'viewAny report', 'view report',
            'viewAny team-member',
        ]);

        // Employee: view own payroll/payslip/attendance, manage own leave.
        $employee->syncPermissions([
            'view payroll',
            'view payslip',
            'viewAny attendance', 'view attendance',
            'viewAny leave', 'view leave', 'create leave', 'update leave', 'delete leave',
        ]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
