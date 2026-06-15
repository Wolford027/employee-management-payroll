<?php

namespace App\Modules\Attendance\Resources;

use App\Models\AttendanceRecord;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin AttendanceRecord
 */
class AttendanceResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_id' => $this->employee_id,
            'employee' => $this->whenLoaded('employee', fn () => [
                'id' => $this->employee?->id,
                'full_name' => $this->employee?->full_name,
                'employee_code' => $this->employee?->employee_code,
            ]),
            'date' => $this->date?->toDateString(),
            'time_in' => $this->time_in,
            'time_out' => $this->time_out,
            'hours_worked' => $this->hours_worked,
            'status' => $this->status,
            'notes' => $this->notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
