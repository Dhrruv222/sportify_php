<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HealthEndpointTest extends TestCase
{
    public function test_health_returns_ok(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'ok')
            ->assertJsonPath('data.service', 'sportify-server');
    }

    public function test_health_ready_returns_checks(): void
    {
        $response = $this->getJson('/api/health/ready');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'status',
                    'service',
                    'checks' => ['database', 'jwt', 'aiService', 'queue', 'envValidation'],
                ],
            ]);
    }
}
