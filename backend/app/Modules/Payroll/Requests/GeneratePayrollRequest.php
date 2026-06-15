<?php

namespace App\Modules\Payroll\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GeneratePayrollRequest extends FormRequest
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
            'scope' => ['required', 'in:all,employee,department'],
            'employee_id' => ['required_if:scope,employee', 'exists:employees,id'],
            'department_id' => ['required_if:scope,department', 'exists:departments,id'],
        ];
    }
}
