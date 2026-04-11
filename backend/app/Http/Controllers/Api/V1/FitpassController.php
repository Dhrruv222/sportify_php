<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\FitpassService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class FitpassController extends Controller
{
    public function __construct(private readonly FitpassService $svc) {}

    public function plans(Request $request): JsonResponse
    {
        try {
            $active = $request->query('active');
            $activeFlag = $active === null ? true : $active === 'true';
            $plans = $this->svc->listPlans($activeFlag);

            return response()->json(['success' => true, 'data' => $plans]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function subscribe(Request $request): JsonResponse
    {
        try {
            $userId = $request->header('x-user-id');
            if (! $userId) {
                return response()->json(['success' => false, 'error' => 'Missing x-user-id header'], 401);
            }

            $planCode = $request->input('planCode');
            if (! $planCode) {
                return response()->json(['success' => false, 'error' => 'planCode is required'], 400);
            }

            $result = $this->svc->subscribe($userId, $planCode);

            return response()->json(['success' => true, 'data' => $result], 201);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    public function myQr(Request $request): JsonResponse
    {
        try {
            $userId = $request->header('x-user-id');
            if (! $userId) {
                return response()->json(['success' => false, 'error' => 'Missing x-user-id header'], 401);
            }

            $result = $this->svc->getMyQr($userId);

            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 404);
        }
    }

    public function checkin(Request $request): JsonResponse
    {
        try {
            $qrValue = $request->input('qrValue');
            $partnerId = $request->input('partnerId');

            if (! $qrValue || ! $partnerId) {
                return response()->json(['success' => false, 'error' => 'qrValue and partnerId are required'], 400);
            }

            $result = $this->svc->checkin($qrValue, $partnerId);

            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }
}
