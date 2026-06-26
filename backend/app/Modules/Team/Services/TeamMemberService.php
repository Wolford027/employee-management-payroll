<?php

namespace App\Modules\Team\Services;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class TeamMemberService
{
    /** @param array<string,mixed> $params */
    public function list(array $params): LengthAwarePaginator
    {
        return User::where('tenant_id', auth()->user()->tenant_id)
            ->with('roles')
            ->orderBy('created_at')
            ->paginate((int) ($params['per_page'] ?? 15));
    }

    /** @param array<string,mixed> $data */
    public function create(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make('12345678'),
                'status' => 'active',
                'tenant_id' => auth()->user()->tenant_id,
                'is_owner' => false,
                'force_password_change' => true,
            ]);

            $user->assignRole($data['role']);

            return $user->load('roles');
        });
    }

    public function delete(User $user): void
    {
        if ($user->tenant_id !== auth()->user()->tenant_id) {
            abort(403);
        }

        if ($user->is_owner) {
            throw ValidationException::withMessages([
                'user' => ['Cannot remove the tenant owner.'],
            ]);
        }

        $user->delete();
    }
}
