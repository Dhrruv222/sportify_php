<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    public function health(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'status' => 'ok',
                'service' => 'sportify-server',
            ],
        ]);
    }

    public function ready(): JsonResponse
    {
        $errors = [];
        $warnings = [];
        $appEnv = config('app.env', 'local');

        $hasDb = (bool) (config('database.connections.pgsql.host') || config('database.connections.pgsql.url'));
        if (! $hasDb) {
            $errors[] = 'Set DB_HOST or DATABASE_URL';
        }

        $jwtConfigured = (bool) (config('jwt.secret') && config('jwt.refresh_secret'));
        if ($appEnv === 'production' && ! config('jwt.secret')) {
            $errors[] = 'Set JWT_SECRET in production';
        }
        if ($appEnv === 'production' && ! config('jwt.refresh_secret')) {
            $errors[] = 'Set JWT_REFRESH_SECRET in production';
        }
        if ($appEnv !== 'production' && ! config('jwt.secret')) {
            $warnings[] = 'JWT_SECRET is not set; bearer token middleware will not validate tokens';
        }
        if ($appEnv !== 'production' && ! config('jwt.refresh_secret')) {
            $warnings[] = 'JWT_REFRESH_SECRET is not set; refresh-token flow may fail';
        }

        $aiConfigured = (bool) config('services.ai.url');
        $queueMode = config('queue.default') === 'redis' ? 'bullmq' : 'inline';

        if (config('queue.default') !== 'redis') {
            $warnings[] = 'REDIS_URL is not set; news queue will run in inline fallback mode';
        }

        $ok = count($errors) === 0;
        $status = $ok ? 'ready' : 'degraded';
        $code = ($ok || $appEnv !== 'production') ? 200 : 503;

        return response()->json([
            'success' => true,
            'data' => [
                'status' => $status,
                'service' => 'sportify-server',
                'checks' => [
                    'database' => ['configured' => $hasDb],
                    'jwt' => ['configured' => $jwtConfigured],
                    'aiService' => ['configured' => $aiConfigured],
                    'queue' => ['mode' => $queueMode],
                    'envValidation' => [
                        'ok' => $ok,
                        'errors' => $errors,
                        'warnings' => $warnings,
                        'nodeEnv' => $appEnv,
                    ],
                ],
            ],
        ], $code);
    }
}
