<?php

return [
    'auto_ingest_enabled' => env('NEWS_AUTO_INGEST_ENABLED', false),
    'auto_ingest_locales' => env('NEWS_AUTO_INGEST_LOCALES', 'en'),
    'auto_ingest_limit' => (int) env('NEWS_AUTO_INGEST_LIMIT', 5),
    'auto_ingest_interval_minutes' => (int) env('NEWS_AUTO_INGEST_INTERVAL_MINUTES', 15),
    'auto_ingest_run_on_start' => env('NEWS_AUTO_INGEST_RUN_ON_START', false),
    'queue_name' => env('NEWS_QUEUE_NAME', 'news-ingestion'),
];
