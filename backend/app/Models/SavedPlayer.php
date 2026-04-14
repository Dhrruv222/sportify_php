<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavedPlayer extends Model
{
    use HasUuids;
    const UPDATED_AT = null;
    protected $fillable = ['user_id', 'player_id'];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function player(): BelongsTo { return $this->belongsTo(Player::class); }
}
