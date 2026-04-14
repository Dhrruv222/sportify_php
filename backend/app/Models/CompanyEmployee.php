<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompanyEmployee extends Model
{
    use HasUuids;
    const UPDATED_AT = null;
    protected $fillable = ['company_id', 'user_id', 'plan_id'];

    public function company(): BelongsTo { return $this->belongsTo(Company::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function plan(): BelongsTo { return $this->belongsTo(FitpassPlan::class, 'plan_id'); }
}
