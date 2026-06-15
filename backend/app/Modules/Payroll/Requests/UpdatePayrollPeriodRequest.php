<?php

namespace App\Modules\Payroll\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePayrollPeriodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'cycle' => ['sometimes', 'in:weekly,biweekly,semi_monthly,monthly'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['sometimes', 'date', 'after_or_equal:start_date'],
            'pay_date' => ['nullable', 'date'],
            'status' => ['sometimes', 'in:draft,processing,completed,closed'],
        ];
    }
}
