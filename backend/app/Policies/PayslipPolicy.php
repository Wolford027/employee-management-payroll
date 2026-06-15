<?php

namespace App\Policies;

use App\Models\Payslip;
use App\Models\User;

class PayslipPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('viewAny payslip');
    }

    public function view(User $user, Payslip $payslip): bool
    {
        if ($user->employee && $user->employee->id === $payslip->employee_id) {
            return true;
        }

        return $user->can('view payslip');
    }

    public function create(User $user): bool
    {
        return $user->can('create payslip');
    }

    public function delete(User $user, Payslip $payslip): bool
    {
        return $user->can('delete payslip');
    }
}
