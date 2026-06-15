<?php

namespace App\Modules\Auth\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class UserResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'status' => $this->status,
            'roles' => $this->getRoleNames(),
            'permissions' => $this->getAllPermissions()->pluck('name'),
            'employee' => $this->whenLoaded('employee', fn () => $this->employee ? [
                'id' => $this->employee->id,
                'employee_code' => $this->employee->employee_code,
                'full_name' => $this->employee->full_name,
                'department_id' => $this->employee->department_id,
                'position_id' => $this->employee->position_id,
            ] : null),
            'force_password_change' => (bool) $this->force_password_change,
            'created_at' => $this->created_at,
        ];
    }
}
