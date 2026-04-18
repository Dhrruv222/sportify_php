<?php

namespace App\Jobs;

use App\Models\NewsArticle;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;

class IngestNews implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $locale;
    protected $limit;

    public function __construct($locale = 'en', $limit = 10)
    {
        $this->locale = $locale;
        $this->limit = $limit;
    }

    public function handle()
    {
        // Fetch news feed - assuming AI service provides this
        $aiUrl = config('services.ai.url');
        if (!$aiUrl) {
            return;
        }

        $response = Http::timeout(30)->get("{$aiUrl}/internal/news/feed", [
            'locale' => $this->locale,
            'limit' => $this->limit,
        ]);

        if (!$response->successful()) {
            return;
        }

        $feedItems = $response->json()['data'] ?? [];
        $inserted = 0;
        $skipped = 0;

        foreach ($feedItems as $item) {
            $sourceUrl = $item['sourceUrl'] ?? null;
            if ($sourceUrl) {
                $existing = NewsArticle::where('source_url', $sourceUrl)
                    ->where('locale', $item['locale'] ?? $this->locale)
                    ->exists();

                if ($existing) {
                    $skipped++;
                    continue;
                }
            }

            NewsArticle::create([
                'title' => $item['title'],
                'summary' => $item['summary'] ?? null,
                'content' => $item['content'] ?? null,
                'source' => $item['source'],
                'source_url' => $sourceUrl,
                'locale' => $item['locale'] ?? $this->locale,
                'published_at' => isset($item['publishedAt']) ? \Carbon\Carbon::parse($item['publishedAt']) : now(),
                'is_published' => true,
            ]);

            $inserted++;
        }

        // Log or return result
        \Log::info("News ingestion completed: locale={$this->locale}, inserted={$inserted}, skipped={$skipped}");
    }
}