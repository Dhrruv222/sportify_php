<?php

namespace App\Services;

use App\Models\User;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function register(array $data): array
    {
        $gdpr = $data['gdprConsent'] ?? $data['gdpr_consent'] ?? false;
        if ($gdpr !== true && $gdpr !== 'true') {
            throw new \RuntimeException('Explicit GDPR consent is required to create an account.');
        }

        $password = $data['password'] ?? '';
        if (! preg_match('/^(?=.*[A-Z])(?=.*\d).{8,}$/', $password)) {
            throw new \RuntimeException('Password must be at least 8 characters long, contain one uppercase letter and one number.');
        }

        $existing = User::where('email', $data['email'] ?? '')->first();
        if ($existing) {
            throw new \RuntimeException('Email already in use');
        }

        $user = User::create([
            'email' => $data['email'],
            'password' => Hash::make($password),
            'role' => $data['role'] ?? 'FAN',
            'gdpr_consent' => true,
        ]);

        $userPayload = ['id' => $user->id, 'email' => $user->email, 'role' => $user->role];

        return [
            'user' => $userPayload,
            'accessToken' => $this->signAccessToken($user),
            'refreshToken' => $this->signRefreshToken($user),
        ];
    }

    public function login(array $credentials): array
    {
        $user = User::where('email', $credentials['email'] ?? '')->first();
        if (! $user || ! $user->password) {
            throw new \RuntimeException('Invalid Credentials');
        }

        if (! Hash::check($credentials['password'] ?? '', $user->password)) {
            throw new \RuntimeException('Invalid Credentials');
        }

        return [
            'user' => ['id' => $user->id, 'email' => $user->email, 'role' => $user->role],
            'accessToken' => $this->signAccessToken($user),
            'refreshToken' => $this->signRefreshToken($user),
        ];
    }

    public function signAccessToken(User $user): string
    {
        $ttl = config('jwt.access_ttl', 15);

        return JWT::encode([
            'userId' => $user->id,
            'role' => $user->role,
            'exp' => time() + ($ttl * 60),
        ], config('jwt.secret'), 'HS256');
    }

    public function signRefreshToken(User $user): string
    {
        $ttl = config('jwt.refresh_ttl', 43200);

        return JWT::encode([
            'userId' => $user->id,
            'exp' => time() + ($ttl * 60),
        ], config('jwt.refresh_secret'), 'HS256');
    }
}
