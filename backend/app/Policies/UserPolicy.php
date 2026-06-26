<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $authUser): bool
    {
        return $authUser->is_owner || $authUser->hasRole('hr');
    }

    public function create(User $authUser): bool
    {
        return $authUser->is_owner || $authUser->hasRole('hr');
    }

    public function delete(User $authUser, User $targetUser): bool
    {
        return ($authUser->is_owner || $authUser->hasRole('hr'))
            && $authUser->tenant_id === $targetUser->tenant_id;
    }
}
