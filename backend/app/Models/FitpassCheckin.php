<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FitpassCheckin extends Model
{
    use HasUuids;
    public $timestamps = false;
    protected $fillable = ['subscription_id', 'partner_id', 'checked_in_at', 'metadata'];

    protected function casts(): array
    {
        return ['checked_in_at' => 'datetime', 'metadata' => 'json'];
    }

    public function subscription(): BelongsTo { return $this->belongsTo(FitpassSubscription::class, 'subscription_id'); }
}
