<?php

namespace App\Modules\Payroll\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePayrollRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'payroll_period_id' => ['required', 'exists:payroll_periods,id'],
            'employee_id' => [
                'required', 'exists:employees,id',
                Rule::unique('payrolls')->where(
                    fn ($q) => $q->where('payroll_period_id', $this->input('payroll_period_id'))
                ),
            ],
            'basic_salary' => ['required', 'numeric', 'min:0'],
            'status' => ['sometimes', 'in:draft,finalized,paid'],
            'remarks' => ['nullable', 'string'],
            'items' => ['sometimes', 'array'],
            'items.*.type' => ['required_with:items', 'in:allowance,deduction,earning'],
            'items.*.label' => ['required_with:items', 'string', 'max:255'],
            'items.*.amount' => ['required_with:items', 'numeric', 'min:0'],
        ];
    }
}
