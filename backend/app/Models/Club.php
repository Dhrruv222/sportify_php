<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Club extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = ['user_id', 'name', 'description', 'is_verified'];

    protected function casts(): array
    {
        return ['is_verified' => 'boolean'];
    }

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function coaches(): HasMany { return $this->hasMany(Coach::class, 'current_club_id'); }
    public function scouts(): HasMany { return $this->hasMany(Scout::class, 'associated_club_id'); }
}
