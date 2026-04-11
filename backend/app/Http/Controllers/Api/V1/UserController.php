<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class UserController extends Controller
{
    public function account(Request $request): JsonResponse
    {
        try {
            $jwtUser = $request->input('jwt_user');
            $user = User::findOrFail($jwtUser['userId']);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'role' => $user->role,
                    'profilePhoto' => $user->profile_photo,
                    'coverPhoto' => $user->cover_photo,
                    'gdprConsent' => $user->gdpr_consent,
                    'createdAt' => $user->created_at,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function avatarUrl(Request $request): JsonResponse
    {
        try {
            $jwtUser = $request->input('jwt_user');
            $user = User::findOrFail($jwtUser['userId']);

            return response()->json([
                'status' => 'success',
                'data' => ['avatarUrl' => $user->profile_photo],
            ]);
        } catch (\Throwable $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function updatePhotos(Request $request): JsonResponse
    {
        try {
            $jwtUser = $request->input('jwt_user');
            $user = User::findOrFail($jwtUser['userId']);

            $updates = [];
            if ($request->has('profilePhoto')) {
                $updates['profile_photo'] = $request->input('profilePhoto');
            }
            if ($request->has('coverPhoto')) {
                $updates['cover_photo'] = $request->input('coverPhoto');
            }

            if (count($updates) > 0) {
                $user->update($updates);
            }

            return response()->json([
                'status' => 'success',
                'data' => [
                    'profilePhoto' => $user->profile_photo,
                    'coverPhoto' => $user->cover_photo,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy(Request $request): JsonResponse
    {
        try {
            $jwtUser = $request->input('jwt_user');
            $user = User::findOrFail($jwtUser['userId']);
            $user->delete();

            return response()->json(['status' => 'success', 'message' => 'Account deleted']);
        } catch (\Throwable $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}
