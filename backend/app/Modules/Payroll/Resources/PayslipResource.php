<?php

namespace App\Modules\Payroll\Resources;

use App\Models\Payslip;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * @mixin Payslip
 */
class PayslipResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'payslip_number' => $this->payslip_number,
            'payroll_id' => $this->payroll_id,
            'employee_id' => $this->employee_id,
            'employee' => $this->whenLoaded('employee', fn () => [
                'id' => $this->employee?->id,
                'full_name' => $this->employee?->full_name,
                'employee_code' => $this->employee?->employee_code,
            ]),
            'payroll' => $this->whenLoaded('payroll', fn () => [
                'id' => $this->payroll?->id,
                'net_pay' => $this->payroll?->net_pay,
                'period' => $this->payroll?->period?->name,
            ]),
            'has_file' => (bool) $this->file_path,
            'file_url' => $this->file_path ? Storage::disk('public')->url($this->file_path) : null,
            'generated_at' => $this->generated_at,
            'created_at' => $this->created_at,
        ];
    }
}
