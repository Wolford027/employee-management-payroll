<?php

namespace App\Modules\Auth\Services;

use App\DTOs\LoginDTO;
use App\DTOs\RegisterDTO;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Register a new owner account, creating a tenant in the same transaction.
     *
     * @return array{user: User, token: string}
     */
    public function register(RegisterDTO $dto): array
    {
        return DB::transaction(function () use ($dto) {
            $slug = Str::slug($dto->companyName).'-'.Str::lower(Str::random(6));

            $tenant = Tenant::create([
                'name' => $dto->companyName,
                'slug' => $slug,
                'status' => 'active',
            ]);

            $user = User::create([
                'name' => $dto->name,
                'email' => $dto->email,
                'password' => Hash::make($dto->password),
                'status' => 'active',
                'tenant_id' => $tenant->id,
                'is_owner' => true,
            ]);

            $user->assignRole('hr');

            $token = $user->createToken('web')->plainTextToken;

            return ['user' => $user->load('roles', 'permissions', 'tenant'), 'token' => $token];
        });
    }

    /**
     * Validate credentials and issue an API token.
     *
     * @return array{user: User, token: string}
     *
     * @throws ValidationException
     */
    public function login(LoginDTO $dto): array
    {
        $user = User::where('email', $dto->email)->first();

        if (! $user || ! Hash::check($dto->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'email' => ['This account is not active.'],
            ]);
        }

        $token = $user->createToken($dto->deviceName ?? 'web')->plainTextToken;

        return ['user' => $user->load('roles', 'permissions', 'employee'), 'token' => $token];
    }

    /** Revoke the token used for the current request. */
    public function logout(User $user): void
    {
        $user->currentAccessToken()?->delete();
    }

    /**
     * Update the authenticated user's profile.
     *
     * @param  array<string,mixed>  $data
     */
    public function updateProfile(User $user, array $data): User
    {
        $user->fill(array_filter([
            'name' => $data['name'] ?? null,
            'email' => $data['email'] ?? null,
        ]));

        if (! empty($data['password'])) {
            $user->password = Hash::make($data['password']);
            $user->force_password_change = false;
        }

        $user->save();

        return $user->refresh()->load('roles', 'permissions', 'employee');
    }

    /** Send a password-reset link (logged via the `log` mailer in local dev). */
    public function sendResetLink(string $email): string
    {
        $status = Password::sendResetLink(['email' => $email]);

        return __($status);
    }

    /**
     * Reset the user's password using a valid token.
     *
     * @param  array<string,mixed>  $data
     */
    public function resetPassword(array $data): string
    {
        $status = Password::reset(
            $data,
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PasswordReset) {
            throw ValidationException::withMessages(['email' => [__($status)]]);
        }

        return __($status);
    }
}
