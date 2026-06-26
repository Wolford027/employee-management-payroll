<?php

namespace App\Modules\Team\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeamMemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'status' => $this->status,
            'is_owner' => $this->is_owner,
            'force_password_change' => $this->force_password_change,
            'roles' => $this->roles->pluck('name'),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
