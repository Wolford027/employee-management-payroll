<?php

use App\Modules\Team\Controllers\TeamMemberController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/team-members', [TeamMemberController::class, 'index']);
    Route::post('/team-members', [TeamMemberController::class, 'store']);
    Route::delete('/team-members/{teamMember}', [TeamMemberController::class, 'destroy']);
});
