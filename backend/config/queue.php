<?php

return [
    'default' => env('QUEUE_CONNECTION', 'sync'),
    'connections' => [
        'sync' => ['driver' => 'sync'],
        'redis' => [
            'driver' => 'redis',
            'connection' => 'default',
            'queue' => env('NEWS_QUEUE_NAME', 'news-ingestion'),
            'retry_after' => 90,
        ],
    ],
    'batching' => ['database' => env('DB_CONNECTION', 'pgsql'), 'table' => 'job_batches'],
    'failed' => ['driver' => env('QUEUE_FAILED_DRIVER', 'database-uuids'), 'database' => env('DB_CONNECTION', 'pgsql'), 'table' => 'failed_jobs'],
];
