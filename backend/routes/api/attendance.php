<?php

use App\Modules\Attendance\Controllers\AttendanceController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('attendance', AttendanceController::class)->parameter('attendance', 'attendance');
});
