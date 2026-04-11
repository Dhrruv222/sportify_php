<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Users ──────────────────────────────────────────────
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('role')->default('FAN'); // PLAYER,CLUB,AGENT,SCOUT,COACH,FAN,COMPANY
            $table->boolean('gdpr_consent')->default(false);
            $table->string('profile_photo')->nullable();
            $table->string('cover_photo')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable();
        });

        // ── Profile: Club ──────────────────────────────────────
        Schema::create('clubs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->unique();
            $table->string('name');
            $table->string('description')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // ── Profile: Agent ─────────────────────────────────────
        Schema::create('agents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->unique();
            $table->string('agency_name');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // ── Profile: Player ────────────────────────────────────
        Schema::create('players', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->unique();
            $table->uuid('agent_id')->nullable();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('position');
            $table->string('dominant_foot');
            $table->integer('height');
            $table->integer('weight');
            $table->json('skills');
            $table->string('playing_style');
            $table->string('location');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('agent_id')->references('id')->on('agents')->onDelete('set null');
        });

        // ── Profile: Scout ─────────────────────────────────────
        Schema::create('scouts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->unique();
            $table->uuid('associated_club_id')->nullable();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('associated_club_id')->references('id')->on('clubs')->onDelete('set null');
        });

        // ── Profile: Coach ─────────────────────────────────────
        Schema::create('coaches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->unique();
            $table->uuid('current_club_id')->nullable();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('current_club_id')->references('id')->on('clubs')->onDelete('set null');
        });

        // ── Profile: Fan ───────────────────────────────────────
        Schema::create('fans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->unique();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // ── Profile: Company ───────────────────────────────────
        Schema::create('companies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->unique();
            $table->string('name');
            $table->string('industry')->nullable();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // ── Videos ─────────────────────────────────────────────
        Schema::create('videos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->string('description')->nullable();
            $table->string('url');
            $table->string('thumbnail');
            $table->integer('views_count')->default(0);
            $table->timestamp('created_at')->useCurrent();
            $table->uuid('player_id');
            $table->foreign('player_id')->references('id')->on('players')->onDelete('cascade');
        });

        // ── Tags ───────────────────────────────────────────────
        Schema::create('tags', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->unique();
        });

        // ── VideoTag (pivot) ───────────────────────────────────
        Schema::create('video_tags', function (Blueprint $table) {
            $table->uuid('video_id');
            $table->uuid('tag_id');
            $table->primary(['video_id', 'tag_id']);
            $table->foreign('video_id')->references('id')->on('videos')->onDelete('cascade');
            $table->foreign('tag_id')->references('id')->on('tags')->onDelete('cascade');
        });

        // ── Likes ──────────────────────────────────────────────
        Schema::create('likes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('video_id');
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['user_id', 'video_id']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('video_id')->references('id')->on('videos')->onDelete('cascade');
        });

        // ── Comments ───────────────────────────────────────────
        Schema::create('comments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->text('content');
            $table->uuid('user_id');
            $table->uuid('video_id');
            $table->timestamp('created_at')->useCurrent();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('video_id')->references('id')->on('videos')->onDelete('cascade');
        });

        // ── SavedVideo ─────────────────────────────────────────
        Schema::create('saved_videos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('video_id');
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['user_id', 'video_id']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('video_id')->references('id')->on('videos')->onDelete('cascade');
        });

        // ── Follows ────────────────────────────────────────────
        Schema::create('follows', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('follower_id');
            $table->uuid('followed_id');
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['follower_id', 'followed_id']);
            $table->foreign('follower_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('followed_id')->references('id')->on('users')->onDelete('cascade');
        });

        // ── Messages ───────────────────────────────────────────
        Schema::create('messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('sender_id');
            $table->uuid('receiver_id');
            $table->text('content');
            $table->timestamp('created_at')->useCurrent();
            $table->boolean('is_read')->default(false);
            $table->foreign('sender_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('receiver_id')->references('id')->on('users')->onDelete('cascade');
        });

        // ── SavedPlayer ────────────────────────────────────────
        Schema::create('saved_players', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('player_id');
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['user_id', 'player_id']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('player_id')->references('id')->on('players')->onDelete('cascade');
        });

        // ── FitpassPlan ────────────────────────────────────────
        Schema::create('fitpass_plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('description')->nullable();
            $table->integer('price_cents');
            $table->string('currency')->default('EUR');
            $table->integer('duration_days');
            $table->json('features')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ── FitpassSubscription ────────────────────────────────
        Schema::create('fitpass_subscriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('plan_id');
            $table->string('status')->default('active');
            $table->string('qr_value')->unique()->nullable();
            $table->string('qr_image_url')->nullable();
            $table->timestamp('valid_from')->useCurrent();
            $table->timestamp('valid_to');
            $table->timestamps();
            $table->index(['user_id', 'status']);
            $table->index(['plan_id']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('plan_id')->references('id')->on('fitpass_plans');
        });

        // ── FitpassCheckin ─────────────────────────────────────
        Schema::create('fitpass_checkins', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('subscription_id');
            $table->string('partner_id');
            $table->timestamp('checked_in_at')->useCurrent();
            $table->json('metadata')->nullable();
            $table->index(['subscription_id', 'checked_in_at']);
            $table->index(['partner_id', 'checked_in_at']);
            $table->foreign('subscription_id')->references('id')->on('fitpass_subscriptions')->onDelete('cascade');
        });

        // ── CompanyEmployee ────────────────────────────────────
        Schema::create('company_employees', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('company_id');
            $table->uuid('user_id');
            $table->uuid('plan_id');
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['company_id', 'user_id']);
            $table->index(['company_id']);
            $table->index(['user_id']);
            $table->index(['plan_id']);
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('plan_id')->references('id')->on('fitpass_plans');
        });

        // ── NewsArticle ────────────────────────────────────────
        Schema::create('news_articles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->string('summary')->nullable();
            $table->text('content')->nullable();
            $table->string('source')->nullable();
            $table->string('source_url')->nullable();
            $table->string('locale')->default('en');
            $table->timestamp('published_at')->useCurrent();
            $table->boolean('is_published')->default(true);
            $table->timestamps();
            $table->index(['locale', 'published_at']);
            $table->index(['is_published', 'published_at']);
        });

        // ── CareerHistory ──────────────────────────────────────
        Schema::create('career_histories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('player_id');
            $table->string('team_name');
            $table->string('role')->nullable();
            $table->timestamp('start_date');
            $table->timestamp('end_date')->nullable();
            $table->text('description')->nullable();
            $table->foreign('player_id')->references('id')->on('players')->onDelete('cascade');
        });

        // ── Achievement ────────────────────────────────────────
        Schema::create('achievements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('player_id');
            $table->string('title');
            $table->timestamp('date');
            $table->text('description')->nullable();
            $table->foreign('player_id')->references('id')->on('players')->onDelete('cascade');
        });

        // ── EmbeddedVideo ──────────────────────────────────────
        Schema::create('embedded_videos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('player_id');
            $table->string('platform');
            $table->string('url');
            $table->string('title')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->foreign('player_id')->references('id')->on('players')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        $tables = [
            'embedded_videos', 'achievements', 'career_histories', 'news_articles',
            'company_employees', 'fitpass_checkins', 'fitpass_subscriptions', 'fitpass_plans',
            'saved_players', 'messages', 'follows', 'saved_videos', 'comments', 'likes',
            'video_tags', 'tags', 'videos', 'companies', 'fans', 'coaches', 'scouts',
            'agents', 'clubs', 'players', 'users',
        ];

        foreach ($tables as $table) {
            Schema::dropIfExists($table);
        }
    }
};
