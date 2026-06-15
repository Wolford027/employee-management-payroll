<?php

use App\Modules\Employee\Controllers\EmployeeController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::patch('employees/{employee}/archive', [EmployeeController::class, 'archive']);
    Route::post('employees/{employee}/create-account', [EmployeeController::class, 'createAccount']);
    Route::apiResource('employees', EmployeeController::class);
});
