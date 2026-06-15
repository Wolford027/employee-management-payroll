<?php

namespace App\Policies;

use App\Models\PayrollPeriod;
use App\Models\User;

class PayrollPeriodPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('viewAny payroll');
    }

    public function view(User $user, PayrollPeriod $period): bool
    {
        return $user->can('view payroll');
    }

    public function create(User $user): bool
    {
        return $user->can('create payroll');
    }

    public function update(User $user, PayrollPeriod $period): bool
    {
        return $user->can('update payroll');
    }

    public function delete(User $user, PayrollPeriod $period): bool
    {
        return $user->can('delete payroll');
    }
}
