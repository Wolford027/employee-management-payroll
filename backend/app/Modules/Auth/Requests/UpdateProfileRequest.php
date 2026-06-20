<?php

namespace App\Modules\Auth\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $userId = $this->user()->id;

        // Users completing a forced password change (temporary password from
        // account creation, or admin reset) already proved their identity by
        // logging in with it — don't also make them re-enter it here.
        $requiresCurrentPassword = ! $this->user()->force_password_change;

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'current_password' => [
                Rule::requiredIf(fn () => $requiresCurrentPassword && $this->filled('password')),
                'current_password',
            ],
            'password' => ['sometimes', 'confirmed', Password::defaults()],
        ];
    }
}
