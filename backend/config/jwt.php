<?php

return [
    'secret' => env('JWT_SECRET'),
    'refresh_secret' => env('JWT_REFRESH_SECRET'),
    'access_ttl' => (int) env('JWT_ACCESS_TTL', 15),       // minutes
    'refresh_ttl' => (int) env('JWT_REFRESH_TTL', 43200),  // minutes (30 days)
];
