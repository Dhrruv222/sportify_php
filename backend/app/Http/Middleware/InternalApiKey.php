<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Mirrors Node auth.js requireInternalApiKey.
 */
class InternalApiKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $requiredKey = config('app.internal_api_key');

        if (! $requiredKey) {
            return $next($request);
        }

        if ($request->header('x-internal-api-key') !== $requiredKey) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid internal API key',
            ], 401);
        }

        return $next($request);
    }
}
