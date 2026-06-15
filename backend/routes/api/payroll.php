<?php

use App\Models\Allowance;
use App\Models\Deduction;
use App\Models\LeaveType;
use App\Modules\Payroll\Controllers\PayrollController;
use App\Modules\Payroll\Controllers\PayrollPeriodController;
use App\Modules\Payroll\Controllers\PayslipController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('payroll-periods', PayrollPeriodController::class)->parameter('payroll-periods', 'payrollPeriod');

    Route::post('payrolls/generate', [PayrollController::class, 'generate']);
    Route::apiResource('payrolls', PayrollController::class);

    // Payslips (PDF generation, download, preview).
    Route::post('payrolls/{payroll}/payslip', [PayslipController::class, 'generate']);
    Route::get('payslips/{payslip}/download', [PayslipController::class, 'download']);
    Route::get('payslips/{payslip}/preview', [PayslipController::class, 'preview']);
    Route::apiResource('payslips', PayslipController::class)->only(['index', 'show']);

    // Reference lookups (read-only) used by payroll/employee forms.
    Route::get('allowances', fn () => Allowance::where('status', 'active')->orderBy('name')->get());
    Route::get('deductions', fn () => Deduction::where('status', 'active')->orderBy('name')->get());
    Route::get('leave-types', fn () => LeaveType::where('status', 'active')->orderBy('name')->get());
});
