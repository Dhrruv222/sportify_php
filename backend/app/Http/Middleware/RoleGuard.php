<?php

namespace App\Http\Middleware;

use Closure;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Mirrors Node roleGuard.js — decodes Bearer JWT, attaches user to request,
 * optionally restricts by role list passed as middleware parameter.
 */
class RoleGuard
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $authHeader = $request->header('Authorization', '');

        if (! str_starts_with($authHeader, 'Bearer ')) {
            return response()->json(['message' => 'No autorizado. Token faltante.'], 401);
        }

        $token = substr($authHeader, 7);
        $secret = config('jwt.secret');

        if (! $secret) {
            return response()->json(['message' => 'Invalid or expired token'], 401);
        }

        try {
            $decoded = JWT::decode($token, new Key($secret, 'HS256'));
        } catch (\Throwable) {
            return response()->json(['message' => 'Invalid or expired token'], 401);
        }

        $request->merge([
            'jwt_user' => [
                'userId' => $decoded->userId ?? null,
                'role' => $decoded->role ?? null,
            ],
        ]);

        if (count($roles) > 0 && ! in_array($decoded->role ?? '', $roles, true)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Access denied. Role required: ' . implode(' o ', $roles),
            ], 403);
        }

        return $next($request);
    }
}
