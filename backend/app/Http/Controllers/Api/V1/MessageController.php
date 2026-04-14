<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    public function conversations(Request $request): JsonResponse
    {
        try {
            $jwtUser = $request->input('jwt_user');
            $userId = $jwtUser['userId'];

            // Get distinct conversation partners with latest message
            $conversations = DB::select("
                SELECT DISTINCT ON (partner_id) *
                FROM (
                    SELECT
                        CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END AS partner_id,
                        content AS last_message,
                        created_at,
                        is_read
                    FROM messages
                    WHERE sender_id = ? OR receiver_id = ?
                    ORDER BY created_at DESC
                ) sub
                ORDER BY partner_id, created_at DESC
            ", [$userId, $userId, $userId]);

            // Hydrate partner info
            $partnerIds = array_map(fn ($c) => $c->partner_id, $conversations);
            $partners = User::whereIn('id', $partnerIds)
                ->get(['id', 'email', 'role', 'profile_photo'])
                ->keyBy('id');

            $result = array_map(function ($c) use ($partners) {
                $partner = $partners[$c->partner_id] ?? null;

                return [
                    'partnerId' => $c->partner_id,
                    'partnerEmail' => $partner?->email,
                    'partnerRole' => $partner?->role,
                    'partnerPhoto' => $partner?->profile_photo,
                    'lastMessage' => $c->last_message,
                    'lastMessageAt' => $c->created_at,
                    'isRead' => $c->is_read,
                ];
            }, $conversations);

            // Sort by lastMessageAt desc
            usort($result, fn ($a, $b) => $b['lastMessageAt'] <=> $a['lastMessageAt']);

            return response()->json(['status' => 'success', 'data' => $result]);
        } catch (\Throwable $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function unreadCount(Request $request): JsonResponse
    {
        try {
            $jwtUser = $request->input('jwt_user');
            $count = Message::where('receiver_id', $jwtUser['userId'])
                ->where('is_read', false)
                ->count();

            return response()->json(['status' => 'success', 'data' => ['unreadCount' => $count]]);
        } catch (\Throwable $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function thread(Request $request, string $userId): JsonResponse
    {
        try {
            $jwtUser = $request->input('jwt_user');
            $myId = $jwtUser['userId'];

            $messages = Message::where(function ($q) use ($myId, $userId) {
                $q->where('sender_id', $myId)->where('receiver_id', $userId);
            })->orWhere(function ($q) use ($myId, $userId) {
                $q->where('sender_id', $userId)->where('receiver_id', $myId);
            })->orderBy('created_at', 'asc')->get();

            return response()->json(['status' => 'success', 'data' => $messages]);
        } catch (\Throwable $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function send(Request $request, string $userId): JsonResponse
    {
        try {
            $jwtUser = $request->input('jwt_user');
            $senderId = $jwtUser['userId'];
            $content = $request->input('content');

            if (! $content) {
                return response()->json(['status' => 'error', 'message' => 'Content is required'], 400);
            }

            User::findOrFail($userId); // recipient must exist

            $message = Message::create([
                'sender_id' => $senderId,
                'receiver_id' => $userId,
                'content' => $content,
            ]);

            return response()->json(['status' => 'success', 'data' => $message], 201);
        } catch (\Throwable $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 400);
        }
    }

    public function markAsRead(Request $request, string $userId): JsonResponse
    {
        try {
            $jwtUser = $request->input('jwt_user');
            $myId = $jwtUser['userId'];

            $updated = Message::where('sender_id', $userId)
                ->where('receiver_id', $myId)
                ->where('is_read', false)
                ->update(['is_read' => true]);

            return response()->json(['status' => 'success', 'data' => ['marked' => $updated]]);
        } catch (\Throwable $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}
