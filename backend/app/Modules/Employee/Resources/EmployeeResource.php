<?php

namespace App\Modules\Employee\Resources;

use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Employee
 */
class EmployeeResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_code' => $this->employee_code,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'salary' => $this->salary,
            'date_hired' => $this->date_hired?->toDateString(),
            'employment_type' => $this->employment_type,
            'status' => $this->status,
            'has_account' => $this->user_id !== null,
            'user_id' => $this->user_id,
            'department_id' => $this->department_id,
            'position_id' => $this->position_id,
            'department' => $this->whenLoaded('department', fn () => [
                'id' => $this->department?->id,
                'name' => $this->department?->name,
            ]),
            'position' => $this->whenLoaded('position', fn () => [
                'id' => $this->position?->id,
                'title' => $this->position?->title,
                'level' => $this->position?->level,
            ]),
            'profile' => $this->whenLoaded('profile', fn () => $this->profile),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
