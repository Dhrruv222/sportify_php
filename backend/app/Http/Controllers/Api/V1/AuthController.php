<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\AuthService;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use App\Models\User;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService) {}

    public function register(Request $request): JsonResponse
    {
        try {
            $result = $this->authService->register($request->all());

            return response()->json([
                'status' => 'success',
                'data' => [
                    'user' => $result['user'],
                    'accessToken' => $result['accessToken'],
                ],
            ], 201)->cookie(
                'refreshToken',
                $result['refreshToken'],
                30 * 24 * 60, // 30 days in minutes
                '/',
                null,
                config('app.env') === 'production',
                true,
                false,
                'strict'
            );
        } catch (\Throwable $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 400);
        }
    }

    public function login(Request $request): JsonResponse
    {
        try {
            $result = $this->authService->login($request->all());

            return response()->json([
                'status' => 'success',
                'data' => [
                    'user' => $result['user'],
                    'accessToken' => $result['accessToken'],
                ],
            ])->cookie(
                'refreshToken',
                $result['refreshToken'],
                30 * 24 * 60,
                '/',
                null,
                config('app.env') === 'production',
                true,
                false,
                'strict'
            );
        } catch (\Throwable $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 401);
        }
    }

    public function redirectToGoogle(): JsonResponse
    {
        // In production this would redirect. Returning 302-style info for parity.
        $url = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query([
            'client_id' => config('services.google.client_id'),
            'redirect_uri' => config('services.google.redirect'),
            'scope' => 'profile email',
            'response_type' => 'code',
        ]);

        return response()->json(['redirect' => $url], 302);
    }

    public function handleGoogleCallback(Request $request): JsonResponse
    {
        try {
            // Simplified: in production use Laravel Socialite
            $email = $request->input('email');
            if (! $email) {
                return response()->json(['status' => 'error', 'message' => 'Missing email from OAuth'], 400);
            }

            $user = User::where('email', $email)->first();

            if (! $user) {
                $user = User::create([
                    'email' => $email,
                    'password' => bcrypt(bin2hex(random_bytes(16))),
                    'role' => 'FAN',
                    'gdpr_consent' => true,
                ]);
            }

            $accessToken = $this->authService->signAccessToken($user);
            $refreshToken = $this->authService->signRefreshToken($user);

            return response()->json([
                'status' => 'success',
                'message' => 'Successful Google Login',
                'data' => [
                    'user' => ['id' => $user->id, 'email' => $user->email, 'role' => $user->role],
                    'accessToken' => $accessToken,
                ],
            ])->cookie('refreshToken', $refreshToken, 30 * 24 * 60, '/', null, config('app.env') === 'production', true, false, 'strict');
        } catch (\Throwable $e) {
            return response()->json(['status' => 'error', 'message' => 'Authentication error with Google'], 500);
        }
    }

    public function refresh(Request $request): JsonResponse
    {
        $token = $request->cookie('refreshToken');
        if (! $token) {
            return response()->json(['message' => 'There is no refresh token'], 401);
        }

        try {
            $decoded = JWT::decode($token, new Key(config('jwt.refresh_secret'), 'HS256'));
            $user = User::find($decoded->userId);

            if (! $user) {
                return response()->json(['message' => 'User does not exist'], 401);
            }

            $newAccessToken = $this->authService->signAccessToken($user);

            return response()->json([
                'status' => 'success',
                'data' => ['accessToken' => $newAccessToken],
            ]);
        } catch (\Throwable) {
            return response()->json(['message' => 'Session expired, please log in again'], 403);
        }
    }

    public function logout(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Sesión cerrada exitosamente',
        ])->withoutCookie('refreshToken');
    }

    // RBAC test endpoints (parity with Node)
    public function profileTest(Request $request): JsonResponse
    {
        return response()->json(['message' => 'Welcome to your profile', 'user' => $request->input('jwt_user')]);
    }

    public function adminStatsTest(): JsonResponse
    {
        return response()->json(['message' => 'Welcome, Administrator. Here are the statistics.']);
    }

    public function playerUploadTest(): JsonResponse
    {
        return response()->json(['message' => 'Upload your videos here']);
    }
}
