<?php

namespace App\Modules\Payroll\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePayrollRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'basic_salary' => ['sometimes', 'numeric', 'min:0'],
            'status' => ['sometimes', 'in:draft,finalized,paid'],
            'remarks' => ['nullable', 'string'],
            'items' => ['sometimes', 'array'],
            'items.*.type' => ['required_with:items', 'in:allowance,deduction,earning'],
            'items.*.label' => ['required_with:items', 'string', 'max:255'],
            'items.*.amount' => ['required_with:items', 'numeric', 'min:0'],
        ];
    }
}
