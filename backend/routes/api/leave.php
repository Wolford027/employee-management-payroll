<?php

use App\Modules\Leave\Controllers\LeaveController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('leaves', LeaveController::class)->parameter('leaves', 'leave');
});
