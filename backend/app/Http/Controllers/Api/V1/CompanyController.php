<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\CompanyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class CompanyController extends Controller
{
    public function __construct(private readonly CompanyService $svc) {}

    public function listEmployees(Request $request): JsonResponse
    {
        try {
            $userId = $request->input('auth_user.userId') ?? $request->input('jwt_user.userId');
            $employees = $this->svc->listEmployees($userId);

            return response()->json(['success' => true, 'data' => $employees]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    public function addEmployee(Request $request): JsonResponse
    {
        try {
            $userId = $request->input('auth_user.userId') ?? $request->input('jwt_user.userId');
            $email = $request->input('email');
            $planId = $request->input('planId');

            if (! $email || ! $planId) {
                return response()->json(['success' => false, 'error' => 'email and planId are required'], 400);
            }

            $result = $this->svc->addEmployee($userId, $email, $planId);

            return response()->json(['success' => true, 'data' => $result], 201);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    public function removeEmployee(Request $request, string $id): JsonResponse
    {
        try {
            $userId = $request->input('auth_user.userId') ?? $request->input('jwt_user.userId');
            $this->svc->removeEmployee($userId, $id);

            return response()->json(['success' => true, 'data' => ['removed' => $id]]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    public function stats(Request $request): JsonResponse
    {
        try {
            $userId = $request->input('auth_user.userId') ?? $request->input('jwt_user.userId');
            $stats = $this->svc->stats($userId);

            return response()->json(['success' => true, 'data' => $stats]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }
}
