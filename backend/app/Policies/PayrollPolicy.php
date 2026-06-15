<?php

namespace App\Policies;

use App\Models\Payroll;
use App\Models\User;

class PayrollPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('viewAny payroll');
    }

    public function view(User $user, Payroll $payroll): bool
    {
        if ($user->employee && $user->employee->id === $payroll->employee_id) {
            return true;
        }

        return $user->can('view payroll');
    }

    public function create(User $user): bool
    {
        return $user->can('create payroll');
    }

    public function update(User $user, Payroll $payroll): bool
    {
        return $user->can('update payroll');
    }

    public function delete(User $user, Payroll $payroll): bool
    {
        return $user->can('delete payroll');
    }

    public function generate(User $user): bool
    {
        return $user->can('create payroll');
    }
}
