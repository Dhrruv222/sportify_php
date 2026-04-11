<?php

namespace App\Services;

use App\Models\Company;
use App\Models\CompanyEmployee;
use App\Models\FitpassPlan;
use App\Models\FitpassSubscription;
use App\Models\User;
use Illuminate\Support\Str;

class CompanyService
{
    public function listEmployees(string $userId): array
    {
        $company = $this->resolveCompany($userId);

        $employees = CompanyEmployee::with(['user:id,email,role', 'plan:id,code,name'])
            ->where('company_id', $company->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return $employees->toArray();
    }

    public function addEmployee(string $userId, string $email, string $planId): array
    {
        $company = $this->resolveCompany($userId);
        $plan = FitpassPlan::findOrFail($planId);

        $employee = User::where('email', $email)->first();
        if (! $employee) {
            throw new \RuntimeException("No user with email '$email'");
        }

        $existing = CompanyEmployee::where('company_id', $company->id)
            ->where('user_id', $employee->id)
            ->first();

        if ($existing) {
            throw new \RuntimeException('Employee already assigned to this company');
        }

        $record = CompanyEmployee::create([
            'company_id' => $company->id,
            'user_id' => $employee->id,
            'plan_id' => $plan->id,
        ]);

        // Auto-create subscription for the employee
        $validFrom = now();
        $validTo = now()->addDays($plan->duration_days);
        $qrValue = 'FITPASS-' . strtoupper(Str::random(8));

        FitpassSubscription::create([
            'user_id' => $employee->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'qr_value' => $qrValue,
            'qr_image_url' => config('services.media.base_url', 'https://media.sportify.dev') . '/qr/' . $qrValue . '.png',
            'valid_from' => $validFrom,
            'valid_to' => $validTo,
        ]);

        return $record->load(['user:id,email,role', 'plan:id,code,name'])->toArray();
    }

    public function removeEmployee(string $userId, string $employeeRecordId): void
    {
        $company = $this->resolveCompany($userId);

        $record = CompanyEmployee::where('company_id', $company->id)
            ->where('id', $employeeRecordId)
            ->first();

        if (! $record) {
            throw new \RuntimeException('Employee record not found');
        }

        $record->delete();
    }

    public function stats(string $userId): array
    {
        $company = $this->resolveCompany($userId);

        $totalEmployees = CompanyEmployee::where('company_id', $company->id)->count();
        $activeSubscriptions = FitpassSubscription::whereIn(
            'user_id',
            CompanyEmployee::where('company_id', $company->id)->pluck('user_id')
        )->where('status', 'active')
            ->where('valid_to', '>', now())
            ->count();

        return [
            'companyId' => $company->id,
            'companyName' => $company->name,
            'totalEmployees' => $totalEmployees,
            'activeSubscriptions' => $activeSubscriptions,
        ];
    }

    private function resolveCompany(string $userId): Company
    {
        $company = Company::where('user_id', $userId)->first();
        if (! $company) {
            throw new \RuntimeException('Company profile not found for this user');
        }

        return $company;
    }
}
