<?php

use App\Modules\Team\Controllers\TeamMemberController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::middleware('permission:viewAny team-member')->group(function () {
        Route::get('/team-members', [TeamMemberController::class, 'index']);
    });
    Route::middleware('permission:create team-member')->post('/team-members', [TeamMemberController::class, 'store']);
    Route::middleware('permission:delete team-member')->delete('/team-members/{teamMember}', [TeamMemberController::class, 'destroy']);
});
