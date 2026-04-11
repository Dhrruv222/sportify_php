<?php

return [
    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID', 'dummy_id'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET', 'dummy_secret'),
        'redirect' => env('GOOGLE_CALLBACK_URL', 'http://localhost:8000/api/v1/auth/oauth/callback'),
    ],

    'ai' => [
        'url' => env('AI_SERVICE_URL', 'http://localhost:8000'),
        'api_key' => env('AI_INTERNAL_API_KEY'),
    ],

    'media' => [
        'provider' => env('MEDIA_PROVIDER', 'mock'),
        'mock_base_url' => env('MEDIA_MOCK_BASE_URL', 'http://mock-s3.local/upload'),
        'upload_expires_seconds' => 900,
    ],
];
