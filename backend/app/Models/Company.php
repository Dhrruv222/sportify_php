<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    use HasUuids;
    public $timestamps = false;
    protected $fillable = ['user_id', 'name', 'industry'];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function employees(): HasMany { return $this->hasMany(CompanyEmployee::class); }
}
