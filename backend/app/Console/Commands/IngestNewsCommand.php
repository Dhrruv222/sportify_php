<?php

namespace App\Console\Commands;

use App\Jobs\IngestNews;
use Illuminate\Console\Command;

class IngestNewsCommand extends Command
{
    protected $signature = 'news:ingest {locale=en} {--limit=10}';

    protected $description = 'Ingest news articles from external feed';

    public function handle()
    {
        $locale = $this->argument('locale');
        $limit = (int) $this->option('limit');

        IngestNews::dispatch($locale, $limit);

        $this->info("News ingestion job dispatched for locale: {$locale}, limit: {$limit}");
    }
}