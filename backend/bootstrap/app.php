<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'role.guard' => \App\Http\Middleware\RoleGuard::class,
            'require.auth' => \App\Http\Middleware\RequireAuth::class,
            'require.roles' => \App\Http\Middleware\RequireRoles::class,
            'internal.api.key' => \App\Http\Middleware\InternalApiKey::class,
        ]);

        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->shouldRenderJsonWhen(fn () => true);
    })
    ->create();
