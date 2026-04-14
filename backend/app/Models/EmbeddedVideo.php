<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmbeddedVideo extends Model
{
    use HasUuids;
    const UPDATED_AT = null;
    protected $fillable = ['player_id', 'platform', 'url', 'title'];

    public function player(): BelongsTo { return $this->belongsTo(Player::class); }
}
