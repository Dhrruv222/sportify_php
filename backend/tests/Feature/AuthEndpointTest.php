<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthEndpointTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_success(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'email' => 'new@sportify.dev',
            'password' => 'Password1',
            'role' => 'FAN',
            'gdprConsent' => true,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure(['status', 'data' => ['user', 'accessToken']]);
    }

    public function test_register_weak_password(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'email' => 'weak@sportify.dev',
            'password' => 'short',
            'gdprConsent' => true,
        ]);

        $response->assertStatus(400);
    }

    public function test_register_no_gdpr(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'email' => 'nogdpr@sportify.dev',
            'password' => 'Password1',
            'gdprConsent' => false,
        ]);

        $response->assertStatus(400);
    }

    public function test_login_success(): void
    {
        // Create user first
        User::create([
            'email' => 'login@sportify.dev',
            'password' => bcrypt('Password1'),
            'role' => 'FAN',
            'gdpr_consent' => true,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'login@sportify.dev',
            'password' => 'Password1',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure(['status', 'data' => ['user', 'accessToken']]);
    }

    public function test_login_invalid_credentials(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'nobody@sportify.dev',
            'password' => 'wrong',
        ]);

        $response->assertStatus(401);
    }

    public function test_refresh_no_cookie_returns_401(): void
    {
        $response = $this->postJson('/api/v1/auth/refresh');

        $response->assertStatus(401);
    }

    public function test_logout_clears_cookie(): void
    {
        $response = $this->postJson('/api/v1/auth/logout');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');
    }
}
