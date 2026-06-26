<?php

namespace App\Modules\Employee\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $id = $this->route('employee')?->id;

        return [
            'employee_code' => ['sometimes', 'string', 'max:50', Rule::unique('employees', 'employee_code')->ignore($id)],
            'first_name' => ['sometimes', 'string', 'max:255'],
            'last_name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('employees', 'email')->ignore($id)],
            'phone' => ['nullable', 'string', 'max:50'],
            'salary' => ['sometimes', 'numeric', 'min:0'],
            'date_hired' => ['nullable', 'date'],
            'employment_type' => ['sometimes', 'in:full_time,part_time,contract'],
            'status' => ['sometimes', 'in:active,inactive,archived'],
            'department_id' => ['nullable', 'integer', Rule::exists('departments', 'id')->where('tenant_id', auth()->user()->tenant_id)],
            'position_id' => ['nullable', 'integer', Rule::exists('positions', 'id')->where('tenant_id', auth()->user()->tenant_id)],

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
