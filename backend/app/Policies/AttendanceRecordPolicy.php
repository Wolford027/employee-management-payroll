<?php

namespace App\Policies;

use App\Models\AttendanceRecord;
use App\Models\User;

class AttendanceRecordPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('viewAny attendance');
    }

    public function view(User $user, AttendanceRecord $record): bool
    {
        if ($user->employee && $user->employee->id === $record->employee_id) {
            return true;
        }

        return $user->can('view attendance');
    }

    public function create(User $user): bool
    {
        return $user->can('create attendance');
    }

    public function update(User $user, AttendanceRecord $record): bool
    {
        return $user->can('update attendance');
    }

    public function delete(User $user, AttendanceRecord $record): bool
    {
        return $user->can('delete attendance');
    }
}
