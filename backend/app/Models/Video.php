<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Video extends Model
{
    use HasUuids;

    const UPDATED_AT = null;

    protected $fillable = [
        'title', 'description', 'url', 'thumbnail', 'views_count', 'player_id',
    ];

    protected function casts(): array
    {
        return ['views_count' => 'integer'];
    }

    public function player(): BelongsTo { return $this->belongsTo(Player::class); }
    public function tags(): BelongsToMany { return $this->belongsToMany(Tag::class, 'video_tags'); }
    public function likes(): HasMany { return $this->hasMany(Like::class); }
    public function comments(): HasMany { return $this->hasMany(Comment::class); }
    public function savedBy(): HasMany { return $this->hasMany(SavedVideo::class); }
}
