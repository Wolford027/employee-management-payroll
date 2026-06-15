<?php

namespace App\Modules\Position\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePositionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'level' => ['sometimes', 'in:Junior,Mid,Senior'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'base_salary' => ['sometimes', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'status' => ['sometimes', 'in:active,inactive'],
        ];
    }
}
