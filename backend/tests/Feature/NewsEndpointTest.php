<?php

namespace Tests\Feature;

use App\Models\NewsArticle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NewsEndpointTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_returns_paginated(): void
    {
        NewsArticle::create([
            'title' => 'Test article',
            'locale' => 'en',
            'published_at' => now(),
            'is_published' => true,
        ]);

        $response = $this->getJson('/api/v1/news');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['success', 'data' => ['articles', 'pagination']]);
    }

    public function test_store_creates_article(): void
    {
        $response = $this->postJson('/api/v1/news', [
            'title' => 'New Article',
            'content' => 'Body text',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true);
    }

    public function test_show_returns_404_for_missing(): void
    {
        $response = $this->getJson('/api/v1/news/00000000-0000-0000-0000-000000000000');

        $response->assertStatus(404);
    }

    public function test_internal_ingest_requires_api_key(): void
    {
        $response = $this->postJson('/api/v1/news/internal/ingest', [
            'articles' => [],
        ]);

        $response->assertStatus(403);
    }
}
