<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\SavedPlayer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class ShortlistController extends Controller
{
    public function save(Request $request, string $playerId): JsonResponse
    {
        try {
            $jwtUser = $request->input('jwt_user');
            $userId = $jwtUser['userId'];

            $existing = SavedPlayer::where('user_id', $userId)->where('player_id', $playerId)->first();
            if ($existing) {
                return response()->json(['status' => 'error', 'message' => 'Player already saved'], 409);
            }

            SavedPlayer::create(['user_id' => $userId, 'player_id' => $playerId]);

            return response()->json(['status' => 'success', 'data' => ['saved' => $playerId]], 201);
        } catch (\Throwable $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 400);
        }
    }

    public function remove(Request $request, string $playerId): JsonResponse
    {
        try {
            $jwtUser = $request->input('jwt_user');
            $userId = $jwtUser['userId'];

            $record = SavedPlayer::where('user_id', $userId)->where('player_id', $playerId)->first();
            if (! $record) {
                return response()->json(['status' => 'error', 'message' => 'Player not in shortlist'], 404);
            }

            $record->delete();

            return response()->json(['status' => 'success', 'data' => ['removed' => $playerId]]);
        } catch (\Throwable $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 400);
        }
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $jwtUser = $request->input('jwt_user');
            $userId = $jwtUser['userId'];

            $saved = SavedPlayer::with('player.user:id,email,role,profile_photo')
                ->where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json(['status' => 'success', 'data' => $saved]);
        } catch (\Throwable $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}
