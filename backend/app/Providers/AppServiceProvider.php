<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Super Admin bypasses all permission/policy checks.
        Gate::before(function ($user, string $ability) {
            return $user->hasRole('super-admin') ? true : null;
        });

        // Password-reset links point at the Next.js frontend, not a Blade page.
        ResetPassword::createUrlUsing(function ($notifiable, string $token) {
            $frontend = rtrim((string) env('FRONTEND_URL', 'http://localhost:3000'), '/');

            return "{$frontend}/reset-password?token={$token}&email=".urlencode($notifiable->getEmailForPasswordReset());
        });
    }
}
