<?php

namespace App\Services;

use App\Models\FitpassCheckin;
use App\Models\FitpassPlan;
use App\Models\FitpassSubscription;
use App\Models\User;
use Illuminate\Support\Str;

class FitpassService
{
    public function listPlans(bool $activeOnly = true): array
    {
        $query = FitpassPlan::query();
        if ($activeOnly) {
            $query->where('is_active', true);
        }

        return $query->orderBy('price_cents')->get()->toArray();
    }

    public function subscribe(string $userId, string $planCode): array
    {
        $user = User::findOrFail($userId);
        $plan = FitpassPlan::where('code', $planCode)->first();
        if (! $plan) {
            throw new \RuntimeException("Plan with code '$planCode' not found");
        }
        if (! $plan->is_active) {
            throw new \RuntimeException("Plan '{$plan->name}' is currently unavailable");
        }

        $existing = FitpassSubscription::where('user_id', $userId)
            ->where('status', 'active')
            ->where('valid_to', '>', now())
            ->first();

        if ($existing) {
            throw new \RuntimeException('Already have an active subscription');
        }

        $validFrom = now();
        $validTo = now()->addDays($plan->duration_days);
        $qrValue = 'FITPASS-' . strtoupper(Str::random(8));
        $qrImageUrl = config('services.media.base_url', 'https://media.sportify.dev') . '/qr/' . $qrValue . '.png';

        $subscription = FitpassSubscription::create([
            'user_id' => $userId,
            'plan_id' => $plan->id,
            'status' => 'active',
            'qr_value' => $qrValue,
            'qr_image_url' => $qrImageUrl,
            'valid_from' => $validFrom,
            'valid_to' => $validTo,
        ]);

        return $subscription->load('plan')->toArray();
    }

    public function getMyQr(string $userId): array
    {
        $sub = FitpassSubscription::with('plan')
            ->where('user_id', $userId)
            ->where('status', 'active')
            ->where('valid_to', '>', now())
            ->first();

        if (! $sub) {
            throw new \RuntimeException('No active subscription');
        }

        return [
            'subscriptionId' => $sub->id,
            'planName' => $sub->plan->name,
            'qrValue' => $sub->qr_value,
            'qrImageUrl' => $sub->qr_image_url,
            'validFrom' => $sub->valid_from,
            'validTo' => $sub->valid_to,
        ];
    }

    public function checkin(string $qrValue, string $partnerId): array
    {
        $sub = FitpassSubscription::where('qr_value', $qrValue)
            ->where('status', 'active')
            ->where('valid_to', '>', now())
            ->first();

        if (! $sub) {
            throw new \RuntimeException('Invalid or expired QR code');
        }

        $checkin = FitpassCheckin::create([
            'subscription_id' => $sub->id,
            'partner_id' => $partnerId,
            'metadata' => ['qr_value' => $qrValue],
        ]);

        return [
            'checkinId' => $checkin->id,
            'subscriptionId' => $sub->id,
            'partnerId' => $partnerId,
            'checkedInAt' => $checkin->checked_in_at,
        ];
    }
}
