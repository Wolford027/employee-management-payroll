<?php

namespace App\Modules\Payroll\Resources;

use App\Models\PayrollPeriod;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin PayrollPeriod
 */
class PayrollPeriodResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'cycle' => $this->cycle,
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'pay_date' => $this->pay_date?->toDateString(),
            'status' => $this->status,
            'payrolls_count' => $this->whenCounted('payrolls'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
