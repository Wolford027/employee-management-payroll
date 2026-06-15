<?php

use App\Modules\Report\Controllers\MeController;
use App\Modules\Report\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('reports/dashboard', [ReportController::class, 'dashboard']);

    // Self-service portal endpoints (current authenticated employee).
    Route::get('me/employee', [MeController::class, 'employee']);
    Route::put('me/employee', [MeController::class, 'updateEmployee']);
    Route::get('me/payrolls', [MeController::class, 'payrolls']);
    Route::get('me/payslips', [MeController::class, 'payslips']);
    Route::get('me/leaves', [MeController::class, 'leaves']);
    Route::get('me/attendance', [MeController::class, 'attendance']);
});
