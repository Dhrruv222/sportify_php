<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class NewsArticle extends Model
{
    use HasUuids;
    protected $fillable = [
        'title', 'summary', 'content', 'source', 'source_url',
        'locale', 'published_at', 'is_published',
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'is_published' => 'boolean',
        ];
    }
}
