<?php

namespace App\Modules\Payroll\Resources;

use App\Models\Payroll;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Payroll
 */
class PayrollResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'payroll_period_id' => $this->payroll_period_id,
            'employee_id' => $this->employee_id,
            'period' => $this->whenLoaded('period', fn () => [
                'id' => $this->period?->id,
                'name' => $this->period?->name,
                'cycle' => $this->period?->cycle,
            ]),
            'employee' => $this->whenLoaded('employee', fn () => [
                'id' => $this->employee?->id,
                'full_name' => $this->employee?->full_name,
                'employee_code' => $this->employee?->employee_code,
            ]),
            'basic_salary' => $this->basic_salary,
            'total_allowances' => $this->total_allowances,
            'total_deductions' => $this->total_deductions,
            'gross_pay' => $this->gross_pay,
            'net_pay' => $this->net_pay,
            'status' => $this->status,
            'remarks' => $this->remarks,
            'items' => PayrollItemResource::collection($this->whenLoaded('items')),
            'payslip' => $this->whenLoaded('payslip', fn () => $this->payslip ? [
                'id' => $this->payslip->id,
                'payslip_number' => $this->payslip->payslip_number,
            ] : null),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
