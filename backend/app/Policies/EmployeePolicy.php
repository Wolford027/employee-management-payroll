<?php

namespace App\Policies;

use App\Models\Employee;
use App\Models\User;

class EmployeePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('viewAny employee');
    }

    public function view(User $user, Employee $employee): bool
    {
        // Employees may always view their own record.
        if ($user->employee && $user->employee->id === $employee->id) {
            return true;
        }

        return $user->can('view employee');
    }

    public function create(User $user): bool
    {
        return $user->can('create employee');
    }

    public function update(User $user, Employee $employee): bool
    {
        return $user->can('update employee');
    }

    public function delete(User $user, Employee $employee): bool
    {
        return $user->can('delete employee');
    }

    public function archive(User $user, Employee $employee): bool
    {
        return $user->can('delete employee');
    }
}
