<?php

namespace App\Policies;

use App\Models\Position;
use App\Models\User;

class PositionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('viewAny position');
    }

    public function view(User $user, Position $position): bool
    {
        return $user->can('view position');
    }

    public function create(User $user): bool
    {
        return $user->can('create position');
    }

    public function update(User $user, Position $position): bool
    {
        return $user->can('update position');
    }

    public function delete(User $user, Position $position): bool
    {
        return $user->can('delete position');
    }
}
