<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Scout extends Model
{
    use HasUuids;
    public $timestamps = false;
    protected $fillable = ['user_id', 'associated_club_id'];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function club(): BelongsTo { return $this->belongsTo(Club::class, 'associated_club_id'); }
}
