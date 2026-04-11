<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    use HasUuids;
    public $timestamps = false;
    protected $fillable = ['name'];

    public function videos(): BelongsToMany { return $this->belongsToMany(Video::class, 'video_tags'); }
}
