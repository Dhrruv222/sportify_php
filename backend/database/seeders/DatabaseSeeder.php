<?php

namespace Database\Seeders;

use App\Models\FitpassPlan;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $passwordHash = Hash::make('Sportify123!');

        $users = [
            ['email' => 'player.test@sportify.dev', 'role' => 'PLAYER'],
            ['email' => 'club.test@sportify.dev', 'role' => 'CLUB'],
            ['email' => 'scout.test@sportify.dev', 'role' => 'SCOUT'],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                [
                    'password' => $passwordHash,
                    'role' => $userData['role'],
                    'gdpr_consent' => true,
                ]
            );
        }

        $fitpassPlans = [
            [
                'code' => 'bronze',
                'name' => 'Bronze',
                'description' => 'Starter fitness access',
                'price_cents' => 1499,
                'currency' => 'EUR',
                'duration_days' => 30,
                'features' => ['1 gym access', 'basic support'],
                'is_active' => true,
            ],
            [
                'code' => 'silver',
                'name' => 'Silver',
                'description' => 'Extended fitness package',
                'price_cents' => 2499,
                'currency' => 'EUR',
                'duration_days' => 30,
                'features' => ['3 gym access', 'priority support'],
                'is_active' => true,
            ],
            [
                'code' => 'gold',
                'name' => 'Gold',
                'description' => 'Full athlete package',
                'price_cents' => 3999,
                'currency' => 'EUR',
                'duration_days' => 30,
                'features' => ['all partner gyms', 'coach add-ons', 'priority support'],
                'is_active' => true,
            ],
            [
                'code' => 'club_plus',
                'name' => 'Club+',
                'description' => 'Multi-user company/club plan',
                'price_cents' => 8999,
                'currency' => 'EUR',
                'duration_days' => 30,
                'features' => ['multi-seat', 'usage analytics', 'employee assignment'],
                'is_active' => true,
            ],
            [
                'code' => 'digital',
                'name' => 'Digital',
                'description' => 'Remote-only training plan',
                'price_cents' => 999,
                'currency' => 'EUR',
                'duration_days' => 30,
                'features' => ['digital workouts', 'nutrition content'],
                'is_active' => true,
            ],
        ];

        foreach ($fitpassPlans as $plan) {
            FitpassPlan::updateOrCreate(
                ['code' => $plan['code']],
                $plan
            );
        }

        echo "✅ Seeded users: player, club, scout\n";
        echo "✅ Seeded FIT-Pass plans: bronze, silver, gold, club_plus, digital\n";
    }
}
