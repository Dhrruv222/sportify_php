<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Model
{
    use HasUuids;

    public const ROLES = ['PLAYER', 'CLUB', 'AGENT', 'SCOUT', 'COACH', 'FAN', 'COMPANY'];

    protected $fillable = [
        'email',
        'password',
        'role',
        'gdpr_consent',
        'profile_photo',
        'cover_photo',
    ];

    protected $hidden = ['password'];

    protected function casts(): array
    {
        return [
            'gdpr_consent' => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    // 1:1 profile relations
    public function player(): HasOne { return $this->hasOne(Player::class); }
    public function club(): HasOne { return $this->hasOne(Club::class); }
    public function agent(): HasOne { return $this->hasOne(Agent::class); }
    public function scout(): HasOne { return $this->hasOne(Scout::class); }
    public function coach(): HasOne { return $this->hasOne(Coach::class); }
    public function fan(): HasOne { return $this->hasOne(Fan::class); }
    public function company(): HasOne { return $this->hasOne(Company::class); }

    // Interaction relations
    public function followers(): HasMany { return $this->hasMany(Follow::class, 'followed_id'); }
    public function following(): HasMany { return $this->hasMany(Follow::class, 'follower_id'); }
    public function messagesSent(): HasMany { return $this->hasMany(Message::class, 'sender_id'); }
    public function messagesReceived(): HasMany { return $this->hasMany(Message::class, 'receiver_id'); }
    public function savedPlayers(): HasMany { return $this->hasMany(SavedPlayer::class); }
    public function savedVideos(): HasMany { return $this->hasMany(SavedVideo::class); }
    public function likes(): HasMany { return $this->hasMany(Like::class); }
    public function comments(): HasMany { return $this->hasMany(Comment::class); }
    public function fitpassSubscriptions(): HasMany { return $this->hasMany(FitpassSubscription::class); }
    public function companyMemberships(): HasMany { return $this->hasMany(CompanyEmployee::class); }
}
