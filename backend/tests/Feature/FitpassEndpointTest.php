<?php

namespace Tests\Feature;

use App\Models\FitpassPlan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FitpassEndpointTest extends TestCase
{
    use RefreshDatabase;

    public function test_plans_returns_list(): void
    {
        FitpassPlan::create([
            'code' => 'bronze',
            'name' => 'Bronze',
            'price_cents' => 1499,
            'currency' => 'EUR',
            'duration_days' => 30,
            'features' => ['1 gym access'],
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/v1/fitpass/plans');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data');
    }

    public function test_subscribe_requires_user_header(): void
    {
        $response = $this->postJson('/api/v1/fitpass/subscribe', [
            'planCode' => 'bronze',
        ]);

        $response->assertStatus(401);
    }

    public function test_myqr_requires_user_header(): void
    {
        $response = $this->getJson('/api/v1/fitpass/me/qr');

        $response->assertStatus(401);
    }

    public function test_checkin_requires_fields(): void
    {
        $response = $this->postJson('/api/v1/fitpass/checkin', []);

        $response->assertStatus(400);
    }
}
