<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Player extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'user_id', 'agent_id', 'first_name', 'last_name', 'position',
        'dominant_foot', 'height', 'weight', 'skills', 'playing_style', 'location',
    ];

    protected function casts(): array
    {
        return ['skills' => 'json', 'height' => 'integer', 'weight' => 'integer'];
    }

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function agent(): BelongsTo { return $this->belongsTo(Agent::class); }
    public function videos(): HasMany { return $this->hasMany(Video::class); }
    public function savedBy(): HasMany { return $this->hasMany(SavedPlayer::class); }
    public function careerHistories(): HasMany { return $this->hasMany(CareerHistory::class); }
    public function careerHistory(): HasMany { return $this->careerHistories(); }
    public function achievements(): HasMany { return $this->hasMany(Achievement::class); }
    public function embeddedVideos(): HasMany { return $this->hasMany(EmbeddedVideo::class); }
}
