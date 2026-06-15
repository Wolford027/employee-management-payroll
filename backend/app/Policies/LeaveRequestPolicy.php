<?php

namespace App\Policies;

use App\Models\LeaveRequest;
use App\Models\User;

class LeaveRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('viewAny leave');
    }

    public function view(User $user, LeaveRequest $leave): bool
    {
        if ($this->ownsRecord($user, $leave)) {
            return true;
        }

        return $user->can('view leave');
    }

    public function create(User $user): bool
    {
        return $user->can('create leave');
    }

    public function update(User $user, LeaveRequest $leave): bool
    {
        if ($this->ownsRecord($user, $leave)) {
            return true;
        }

        return $user->can('update leave');
    }

    public function delete(User $user, LeaveRequest $leave): bool
    {
        if ($this->ownsRecord($user, $leave)) {
            return true;
        }

        return $user->can('delete leave');
    }

    private function ownsRecord(User $user, LeaveRequest $leave): bool
    {
        return $user->employee && $user->employee->id === $leave->employee_id;
    }
}
