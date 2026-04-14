<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CompanyController;
use App\Http\Controllers\Api\V1\FitpassController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\MessageController;
use App\Http\Controllers\Api\V1\NewsController;
use App\Http\Controllers\Api\V1\PlayerController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\ShortlistController;
use App\Http\Controllers\Api\V1\SocialController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

// ── Health ──────────────────────────────────────────────
Route::get('/health', [HealthController::class, 'health']);
Route::get('/health/ready', [HealthController::class, 'ready']);

// ── v1 prefix ───────────────────────────────────────────
Route::prefix('v1')->group(function () {

    // ── Auth (public) ───────────────────────────────────
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::get('/oauth/google', [AuthController::class, 'redirectToGoogle']);
        Route::get('/oauth/callback', [AuthController::class, 'handleGoogleCallback']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::post('/logout', [AuthController::class, 'logout']);

        // RBAC test routes (require jwt decode)
        Route::middleware('role.guard')->group(function () {
            Route::get('/profile', [AuthController::class, 'profileTest']);
        });
        Route::middleware('role.guard:ADMIN')->group(function () {
            Route::get('/admin/stats', [AuthController::class, 'adminStatsTest']);
        });
        Route::middleware('role.guard:PLAYER')->group(function () {
            Route::get('/player/upload', [AuthController::class, 'playerUploadTest']);
        });
    });

    // ── Fitpass ─────────────────────────────────────────
    Route::prefix('fitpass')->group(function () {
        Route::get('/plans', [FitpassController::class, 'plans']);
        Route::post('/subscribe', [FitpassController::class, 'subscribe']);
        Route::get('/me/qr', [FitpassController::class, 'myQr']);
        Route::post('/checkin', [FitpassController::class, 'checkin']);
    });

    // ── Company (requireAuth + COMPANY role) ────────────
    Route::prefix('company')->middleware(['require.auth', 'require.roles:COMPANY'])->group(function () {
        Route::get('/employees', [CompanyController::class, 'listEmployees']);
        Route::post('/employees', [CompanyController::class, 'addEmployee']);
        Route::delete('/employees/{id}', [CompanyController::class, 'removeEmployee']);
        Route::get('/stats', [CompanyController::class, 'stats']);
    });

    // ── News ────────────────────────────────────────────
    Route::prefix('news')->group(function () {
        Route::get('/', [NewsController::class, 'index']);
        Route::post('/', [NewsController::class, 'store']);

        // Internal endpoints
        Route::middleware('internal.api.key')->group(function () {
            Route::post('/internal/ingest', [NewsController::class, 'ingest']);
            Route::post('/internal/enqueue', [NewsController::class, 'enqueue']);
            Route::get('/internal/queue/status', [NewsController::class, 'queueStatus']);
            Route::post('/internal/queue/retry', [NewsController::class, 'retryFailed']);
        });

        Route::get('/{id}', [NewsController::class, 'show']);
    });

    // ── Users (roleGuard JWT) ───────────────────────────
    Route::prefix('users')->middleware('role.guard')->group(function () {
        Route::get('/account', [UserController::class, 'account']);
        Route::get('/avatar-url', [UserController::class, 'avatarUrl']);
        Route::put('/photos', [UserController::class, 'updatePhotos']);
        Route::delete('/account/delete', [UserController::class, 'destroy']);
    });

    // ── Profile (roleGuard JWT) ─────────────────────────
    Route::prefix('profile')->middleware('role.guard')->group(function () {
        Route::get('/', [ProfileController::class, 'show']);
        Route::put('/me', [ProfileController::class, 'update']);

        Route::middleware('role.guard:PLAYER,SCOUT,COMPANY,ADMIN,FAN,COACH')->group(function () {
            Route::post('/me/avatar', [ProfileController::class, 'avatarUploadUrl']);
        });

        Route::middleware('role.guard:PLAYER')->group(function () {
            Route::post('/me/career', [ProfileController::class, 'addCareer']);
            Route::put('/me/career/{id}', [ProfileController::class, 'updateCareer']);
            Route::delete('/me/career/{id}', [ProfileController::class, 'deleteCareer']);
            Route::post('/me/achivements', [ProfileController::class, 'addAchievement']);
            Route::delete('/me/achivements/{id}', [ProfileController::class, 'deleteAchievement']);
        });
    });

    // ── Social (roleGuard JWT) ──────────────────────────
    Route::prefix('social')->middleware('role.guard')->group(function () {
        Route::post('/follow/{id}', [SocialController::class, 'follow']);
        Route::delete('/unfollow/{id}', [SocialController::class, 'unfollow']);
        Route::get('/followers', [SocialController::class, 'followers']);
        Route::get('/following', [SocialController::class, 'following']);
        Route::get('/feed', [SocialController::class, 'feed']);

        Route::middleware('role.guard:SCOUT,CLUB,COMPANY')->group(function () {
            Route::post('/shortlist/saved/{playerId}', [ShortlistController::class, 'save']);
            Route::delete('/shortlist/saved/{playerId}', [ShortlistController::class, 'remove']);
            Route::get('/shortlist/saved', [ShortlistController::class, 'index']);
        });
    });

    // ── Players (roleGuard JWT) ─────────────────────────
    Route::prefix('players')->middleware('role.guard')->group(function () {
        Route::get('/search', [PlayerController::class, 'search']);
    });

    // ── Messages (roleGuard JWT) ────────────────────────
    Route::prefix('messages')->middleware('role.guard')->group(function () {
        Route::get('/conversations', [MessageController::class, 'conversations']);
        Route::get('/unread-count', [MessageController::class, 'unreadCount']);
        Route::get('/thread/{userId}', [MessageController::class, 'thread']);
        Route::post('/send/{userId}', [MessageController::class, 'send']);
        Route::put('/read/{userId}', [MessageController::class, 'markAsRead']);
    });
});
