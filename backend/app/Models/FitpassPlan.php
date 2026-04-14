<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FitpassPlan extends Model
{
    use HasUuids;
    protected $fillable = [
        'code', 'name', 'description', 'price_cents', 'currency',
        'duration_days', 'features', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price_cents' => 'integer',
            'duration_days' => 'integer',
            'features' => 'json',
            'is_active' => 'boolean',
        ];
    }

    public function subscriptions(): HasMany { return $this->hasMany(FitpassSubscription::class, 'plan_id'); }
    public function companyEmployees(): HasMany { return $this->hasMany(CompanyEmployee::class, 'plan_id'); }
}
