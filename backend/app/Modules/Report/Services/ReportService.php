<?php

namespace App\Modules\Report\Services;

use App\Models\AttendanceRecord;
use App\Models\Department;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\Payroll;
use App\Models\PayrollPeriod;
use App\Models\Payslip;
use App\Models\Position;
use Illuminate\Support\Carbon;

class ReportService
{
    /** @return array<string,mixed> */
    public function dashboard(): array
    {
        $today = Carbon::today()->toDateString();

        return [
            'counts' => [
                'employees' => Employee::count(),
                'employees_active' => Employee::where('status', 'active')->count(),
                'departments' => Department::count(),
                'positions' => Position::count(),
                'payrolls' => Payroll::count(),
                'payroll_periods' => PayrollPeriod::count(),
                'payslips' => Payslip::count(),
                'leave_requests' => LeaveRequest::count(),
                'leave_pending' => LeaveRequest::where('status', 'pending')->count(),
                'attendance_today' => AttendanceRecord::whereDate('date', $today)->count(),
            ],
            'employees_by_department' => Department::withCount('employees')
                ->orderBy('name')
                ->get()
                ->map(fn ($d) => ['department' => $d->name, 'count' => $d->employees_count]),
            'latest_period' => $this->latestPeriodSummary(),
        ];
    }

    /** @return array<string,mixed>|null */
    private function latestPeriodSummary(): ?array
    {
        $period = PayrollPeriod::orderByDesc('start_date')->first();

        if (! $period) {
            return null;
        }

        $payrolls = Payroll::where('payroll_period_id', $period->id);

        return [
            'id' => $period->id,
            'name' => $period->name,
            'payroll_count' => (clone $payrolls)->count(),
            'total_net' => round((float) (clone $payrolls)->sum('net_pay'), 2),
            'total_gross' => round((float) (clone $payrolls)->sum('gross_pay'), 2),
        ];
    }
}
