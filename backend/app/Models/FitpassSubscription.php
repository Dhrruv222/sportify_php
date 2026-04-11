<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FitpassSubscription extends Model
{
    use HasUuids;
    protected $fillable = [
        'user_id', 'plan_id', 'status', 'qr_value', 'qr_image_url',
        'valid_from', 'valid_to',
    ];

    protected function casts(): array
    {
        return [
            'valid_from' => 'datetime',
            'valid_to' => 'datetime',
        ];
    }

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function plan(): BelongsTo { return $this->belongsTo(FitpassPlan::class, 'plan_id'); }
    public function checkins(): HasMany { return $this->hasMany(FitpassCheckin::class, 'subscription_id'); }
}
