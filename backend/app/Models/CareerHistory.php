<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CareerHistory extends Model
{
    use HasUuids;
    public $timestamps = false;
    protected $fillable = ['player_id', 'team_name', 'role', 'start_date', 'end_date', 'description'];

    protected function casts(): array
    {
        return ['start_date' => 'datetime', 'end_date' => 'datetime'];
    }

    public function player(): BelongsTo { return $this->belongsTo(Player::class); }
}
