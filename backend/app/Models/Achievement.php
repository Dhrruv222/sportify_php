<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Achievement extends Model
{
    use HasUuids;
    public $timestamps = false;
    protected $fillable = ['player_id', 'title', 'date', 'description'];

    protected function casts(): array
    {
        return ['date' => 'datetime'];
    }

    public function player(): BelongsTo { return $this->belongsTo(Player::class); }
}
