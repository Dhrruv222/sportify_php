<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Achievement;
use App\Models\Agent;
use App\Models\CareerHistory;
use App\Models\Club;
use App\Models\Coach;
use App\Models\Company;
use App\Models\Fan;
use App\Models\Player;
use App\Models\Scout;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        try {
            $jwtUser = $request->input('jwt_user');
            $user = User::findOrFail($jwtUser['userId']);
            $role = $user->role;
            $profile = $this->loadProfile($user);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'email' => $user->email,
                        'role' => $role,
                        'profilePhoto' => $user->profile_photo,
                        'coverPhoto' => $user->cover_photo,
                    ],
                    'profile' => $profile,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request): JsonResponse
    {
        try {
            $jwtUser = $request->input('jwt_user');
            $user = User::findOrFail($jwtUser['userId']);
            $role = $user->role;
            $data = $request->all();

            $profile = $this->upsertProfile($user, $role, $data);

            return response()->json(['status' => 'success', 'data' => $profile]);
        } catch (\Throwable $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 400);
        }
    }

    public function avatarUploadUrl(Request $request): JsonResponse
    {
        $jwtUser = $request->input('jwt_user');

        // Mock presigned URL - parity with Node mediaService
        $ext = $request->input('extension', 'jpg');
        $key = 'avatars/' . $jwtUser['userId'] . '.' . $ext;
        $baseUrl = config('services.media.base_url', 'https://media.sportify.dev');

        return response()->json([
            'status' => 'success',
            'data' => [
                'uploadUrl' => $baseUrl . '/upload/' . $key . '?x-amz-mock=true',
                'publicUrl' => $baseUrl . '/' . $key,
            ],
        ]);
    }

    // ── Career History (PLAYER only) ──────────────────
    public function addCareer(Request $request): JsonResponse
    {
        try {
            $jwtUser = $request->input('jwt_user');
            $player = Player::where('user_id', $jwtUser['userId'])->firstOrFail();

            $career = CareerHistory::create([
                'player_id' => $player->id,
                'team_name' => $request->input('teamName'),
                'role' => $request->input('role'),
                'start_date' => $request->input('startDate'),
                'end_date' => $request->input('endDate'),
                'description' => $request->input('description'),
            ]);

            return response()->json(['status' => 'success', 'data' => $career], 201);
        } catch (\Throwable $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 400);
        }
    }

    public function updateCareer(Request $request, string $id): JsonResponse
    {
        try {
            $jwtUser = $request->input('jwt_user');
            $player = Player::where('user_id', $jwtUser['userId'])->firstOrFail();
            $career = CareerHistory::where('id', $id)->where('player_id', $player->id)->firstOrFail();

            $career->update(array_filter([
                'team_name' => $request->input('teamName'),
                'role' => $request->input('role'),
                'start_date' => $request->input('startDate'),
                'end_date' => $request->input('endDate'),
                'description' => $request->input('description'),
            ], fn ($v) => $v !== null));

            return response()->json(['status' => 'success', 'data' => $career->fresh()]);
        } catch (\Throwable $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 400);
        }
    }

    public function deleteCareer(Request $request, string $id): JsonResponse
    {
        try {
            $jwtUser = $request->input('jwt_user');
            $player = Player::where('user_id', $jwtUser['userId'])->firstOrFail();
            $career = CareerHistory::where('id', $id)->where('player_id', $player->id)->firstOrFail();
            $career->delete();

            return response()->json(['status' => 'success', 'data' => ['deleted' => $id]]);
        } catch (\Throwable $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 400);
        }
    }

    public function addAchievement(Request $request): JsonResponse
    {
        try {
            $jwtUser = $request->input('jwt_user');
            $player = Player::where('user_id', $jwtUser['userId'])->firstOrFail();

            $achievement = Achievement::create([
                'player_id' => $player->id,
                'title' => $request->input('title'),
                'date' => $request->input('date'),
                'description' => $request->input('description'),
            ]);

            return response()->json(['status' => 'success', 'data' => $achievement], 201);
        } catch (\Throwable $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 400);
        }
    }

    public function deleteAchievement(Request $request, string $id): JsonResponse
    {
        try {
            $jwtUser = $request->input('jwt_user');
            $player = Player::where('user_id', $jwtUser['userId'])->firstOrFail();
            $achievement = Achievement::where('id', $id)->where('player_id', $player->id)->firstOrFail();
            $achievement->delete();

            return response()->json(['status' => 'success', 'data' => ['deleted' => $id]]);
        } catch (\Throwable $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 400);
        }
    }

    // ── Helpers ───────────────────────────────────────
    private function loadProfile(User $user): mixed
    {
        return match ($user->role) {
            'PLAYER' => Player::with(['careerHistories', 'achievements', 'embeddedVideos'])->where('user_id', $user->id)->first(),
            'CLUB' => Club::where('user_id', $user->id)->first(),
            'AGENT' => Agent::where('user_id', $user->id)->first(),
            'SCOUT' => Scout::where('user_id', $user->id)->first(),
            'COACH' => Coach::where('user_id', $user->id)->first(),
            'FAN' => Fan::where('user_id', $user->id)->first(),
            'COMPANY' => Company::where('user_id', $user->id)->first(),
            default => null,
        };
    }

    private function upsertProfile(User $user, string $role, array $data): mixed
    {
        return match ($role) {
            'PLAYER' => Player::updateOrCreate(
                ['user_id' => $user->id],
                array_filter([
                    'first_name' => $data['firstName'] ?? null,
                    'last_name' => $data['lastName'] ?? null,
                    'position' => $data['position'] ?? null,
                    'dominant_foot' => $data['dominantFoot'] ?? null,
                    'height' => $data['height'] ?? null,
                    'weight' => $data['weight'] ?? null,
                    'skills' => $data['skills'] ?? null,
                    'playing_style' => $data['playingStyle'] ?? null,
                    'location' => $data['location'] ?? null,
                    'agent_id' => $data['agentId'] ?? null,
                ], fn ($v) => $v !== null)
            ),
            'CLUB' => Club::updateOrCreate(
                ['user_id' => $user->id],
                array_filter([
                    'name' => $data['name'] ?? null,
                    'description' => $data['description'] ?? null,
                ], fn ($v) => $v !== null)
            ),
            'AGENT' => Agent::updateOrCreate(
                ['user_id' => $user->id],
                array_filter(['agency_name' => $data['agencyName'] ?? null], fn ($v) => $v !== null)
            ),
            'SCOUT' => Scout::updateOrCreate(
                ['user_id' => $user->id],
                array_filter(['associated_club_id' => $data['associatedClubId'] ?? null], fn ($v) => $v !== null)
            ),
            'COACH' => Coach::updateOrCreate(
                ['user_id' => $user->id],
                array_filter(['current_club_id' => $data['currentClubId'] ?? null], fn ($v) => $v !== null)
            ),
            'FAN' => Fan::updateOrCreate(['user_id' => $user->id], []),
            'COMPANY' => Company::updateOrCreate(
                ['user_id' => $user->id],
                array_filter([
                    'name' => $data['name'] ?? null,
                    'industry' => $data['industry'] ?? null,
                ], fn ($v) => $v !== null)
            ),
            default => throw new \RuntimeException("Unknown role: $role"),
        };
    }
}
