<?php

namespace App\Http\Middleware;

use Closure;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Mirrors Node auth.js requireAuth — reads Bearer JWT or x-user-id/x-user-role headers.
 */
class RequireAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $auth = $this->readUserFromToken($request) ?? $this->readUserFromHeaders($request);

        if (! $auth || ! ($auth['userId'] ?? null)) {
            return response()->json([
                'success' => false,
                'error' => 'Authentication required',
            ], 401);
        }

        $request->merge(['auth_user' => $auth]);

        return $next($request);
    }

    private function readUserFromToken(Request $request): ?array
    {
        $authHeader = $request->header('Authorization', '');
        if (! str_starts_with($authHeader, 'Bearer ')) {
            return null;
        }

        $token = substr($authHeader, 7);
        $secret = config('jwt.secret');
        if (! $secret) {
            return null;
        }

        try {
            $decoded = JWT::decode($token, new Key($secret, 'HS256'));

            return [
                'userId' => $decoded->userId ?? null,
                'role' => $decoded->role ?? null,
            ];
        } catch (\Throwable) {
            return null;
        }
    }

    private function readUserFromHeaders(Request $request): ?array
    {
        $userId = $request->header('x-user-id');
        if (! $userId) {
            return null;
        }

        return [
            'userId' => $userId,
            'role' => $request->header('x-user-role'),
        ];
    }
}
