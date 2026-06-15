<?php

namespace App\Modules\Attendance\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'employee_id' => ['required', 'exists:employees,id'],
            'date' => [
                'required', 'date',
                Rule::unique('attendance_records')->where(
                    fn ($q) => $q->where('employee_id', $this->input('employee_id'))
                ),
            ],
            'time_in' => ['nullable', 'date_format:H:i,H:i:s'],
            'time_out' => ['nullable', 'date_format:H:i,H:i:s'],
            'hours_worked' => ['sometimes', 'numeric', 'min:0', 'max:24'],
            'status' => ['required', 'in:present,absent,late,on_leave,half_day'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
