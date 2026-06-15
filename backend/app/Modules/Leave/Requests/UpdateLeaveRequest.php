<?php

namespace App\Modules\Leave\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLeaveRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'employee_id' => ['sometimes', 'exists:employees,id'],
            'leave_type_id' => ['sometimes', 'exists:leave_types,id'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['sometimes', 'date', 'after_or_equal:start_date'],
            'days' => ['sometimes', 'integer', 'min:1'],
            'reason' => ['nullable', 'string'],
            'status' => ['sometimes', 'in:pending,approved,rejected,cancelled'],
        ];
    }
}
