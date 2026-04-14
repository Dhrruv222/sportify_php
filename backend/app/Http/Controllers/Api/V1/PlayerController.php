<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Player;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Http;

class PlayerController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        try {
            $query = $request->query('q', '');
            $position = $request->query('position');
            $location = $request->query('location');
            $page = max(1, (int) $request->query('page', 1));
            $limit = min(50, max(1, (int) $request->query('limit', 20)));

            $dbQuery = Player::with('user:id,email,role,profile_photo');

            if ($query) {
                $dbQuery->where(function ($q) use ($query) {
                    $q->where('first_name', 'ilike', "%{$query}%")
                        ->orWhere('last_name', 'ilike', "%{$query}%");
                });
            }
            if ($position) {
                $dbQuery->where('position', $position);
            }
            if ($location) {
                $dbQuery->where('location', 'ilike', "%{$location}%");
            }

            $total = $dbQuery->count();
            $players = $dbQuery->skip(($page - 1) * $limit)->take($limit)->get();

            // Attempt AI scoring if configured
            $aiUrl = config('services.ai.url');
            if ($aiUrl && $players->isNotEmpty()) {
                try {
                    $resp = Http::timeout(5)->post("{$aiUrl}/api/v1/ai/score", [
                        'players' => $players->map(fn ($p) => [
                            'id' => $p->id,
                            'position' => $p->position,
                            'skills' => $p->skills,
                        ])->toArray(),
                    ]);

                    if ($resp->successful()) {
                        $scores = collect($resp->json('scores', []))->keyBy('id');
                        $players = $players->map(function ($p) use ($scores) {
                            $p->ai_score = $scores[$p->id]['score'] ?? null;
                            return $p;
                        });
                    }
                } catch (\Throwable) {
                    // AI service unavailable — continue without scores
                }
            }

            return response()->json([
                'status' => 'success',
                'data' => [
                    'players' => $players,
                    'pagination' => [
                        'page' => $page,
                        'limit' => $limit,
                        'total' => $total,
                    ],
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}
