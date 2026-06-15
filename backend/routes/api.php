<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Routes are grouped per module. Each module registers its own route file
| to keep the API surface modular and easy to expand in later phases.
|
*/

Route::get('/health', fn () => response()->json([
    'status' => 'ok',
    'service' => 'employee-management-payroll',
    'time' => now()->toIso8601String(),
]));

// Module route files (added in later phases).
require __DIR__.'/api/auth.php';
require __DIR__.'/api/employee.php';
require __DIR__.'/api/department.php';
require __DIR__.'/api/position.php';
require __DIR__.'/api/attendance.php';
require __DIR__.'/api/leave.php';
require __DIR__.'/api/payroll.php';
require __DIR__.'/api/report.php';
