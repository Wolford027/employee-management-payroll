<?php

namespace App\Modules\Employee\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'employee_code' => ['required', 'string', 'max:50', 'unique:employees,employee_code'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:employees,email'],
            'phone' => ['nullable', 'string', 'max:50'],
            'salary' => ['required', 'numeric', 'min:0'],
            'date_hired' => ['nullable', 'date'],
            'employment_type' => ['sometimes', 'in:full_time,part_time,contract'],
            'status' => ['sometimes', 'in:active,inactive,archived'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'position_id' => ['nullable', 'exists:positions,id'],
            // Optional: whether to create a linked user account for the employee.
            'create_account' => ['sometimes', 'boolean'],
            // Optional: HR can set a specific initial password; otherwise auto-generated.
            'password' => ['sometimes', 'string', 'min:8'],

            // Optional nested profile.
            'profile' => ['sometimes', 'array'],
            'profile.birth_date' => ['nullable', 'date'],
            'profile.gender' => ['nullable', 'string', 'max:20'],
            'profile.marital_status' => ['nullable', 'string', 'max:20'],
            'profile.address' => ['nullable', 'string'],
            'profile.city' => ['nullable', 'string', 'max:255'],
            'profile.country' => ['nullable', 'string', 'max:255'],
            'profile.emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'profile.emergency_contact_phone' => ['nullable', 'string', 'max:50'],
            'profile.bank_name' => ['nullable', 'string', 'max:255'],
            'profile.bank_account_number' => ['nullable', 'string', 'max:100'],
            'profile.tax_id' => ['nullable', 'string', 'max:100'],
        ];
    }
}
