<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Mirrors Node auth.js requireRoles — checks auth_user.role against allowed set.
 */
class RequireRoles
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $allowed = array_flip($roles);
        $role = $request->input('auth_user.role');

        if (! $role || ! isset($allowed[$role])) {
            return response()->json([
                'success' => false,
                'error' => 'Insufficient permissions',
            ], 403);
        }

        return $next($request);
    }
}
