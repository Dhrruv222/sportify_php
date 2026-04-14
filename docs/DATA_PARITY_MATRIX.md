# Data Model Parity Matrix: Prisma → Eloquent

## Enum Mapping

| Prisma Enum | Laravel Implementation |
|-------------|----------------------|
| UserRole (PLAYER, CLUB, AGENT, SCOUT, COACH, FAN, COMPANY) | String column with validation constant in User model |

## Model Mapping

| # | Prisma Model | Laravel Model | Table | PK Type | Notes |
|---|-------------|---------------|-------|---------|-------|
| 1 | User | User | users | UUID | 1:1 profiles via hasOne |
| 2 | Player | Player | players | UUID | belongsTo User, optional belongsTo Agent |
| 3 | Club | Club | clubs | UUID | belongsTo User, hasMany Coach/Scout |
| 4 | Agent | Agent | agents | UUID | belongsTo User, hasMany Player |
| 5 | Scout | Scout | scouts | UUID | belongsTo User, optional belongsTo Club |
| 6 | Coach | Coach | coaches | UUID | belongsTo User, optional belongsTo Club |
| 7 | Fan | Fan | fans | UUID | belongsTo User |
| 8 | Company | Company | companies | UUID | belongsTo User, hasMany CompanyEmployee |
| 9 | Video | Video | videos | UUID | belongsTo Player |
| 10 | Tag | Tag | tags | UUID | name unique |
| 11 | VideoTag | VideoTag | video_tags | Composite (videoId,tagId) | Pivot |
| 12 | Like | Like | likes | UUID | unique(userId,videoId) |
| 13 | Comment | Comment | comments | UUID | content text |
| 14 | SavedVideo | SavedVideo | saved_videos | UUID | unique(userId,videoId) |
| 15 | Follows | Follow | follows | UUID | unique(followerId,followedId) |
| 16 | Message | Message | messages | UUID | content text, isRead default false |
| 17 | SavedPlayer | SavedPlayer | saved_players | UUID | unique(userId,playerId) |
| 18 | FitpassPlan | FitpassPlan | fitpass_plans | UUID | code unique, features json |
| 19 | FitpassSubscription | FitpassSubscription | fitpass_subscriptions | UUID | qrValue unique, indexes on (userId,status) (planId) |
| 20 | FitpassCheckin | FitpassCheckin | fitpass_checkins | UUID | indexes on (subscriptionId,checkedInAt) (partnerId,checkedInAt) |
| 21 | CompanyEmployee | CompanyEmployee | company_employees | UUID | unique(companyId,userId), indexes on companyId,userId,planId |
| 22 | NewsArticle | NewsArticle | news_articles | UUID | indexes on (locale,publishedAt) (isPublished,publishedAt) |
| 23 | CareerHistory | CareerHistory | career_histories | UUID | belongsTo Player |
| 24 | Achievement | Achievement | achievements | UUID | belongsTo Player |
| 25 | EmbeddedVideo | EmbeddedVideo | embedded_videos | UUID | belongsTo Player |

## Field Type Mapping

| Prisma Type | Laravel Migration Type |
|-------------|----------------------|
| String @id @default(uuid()) | $table->uuid('id')->primary() |
| String @unique | $table->string('...')->unique() |
| String | $table->string('...') |
| String? | $table->string('...')->nullable() |
| String @db.Text | $table->text('...') |
| String? @db.Text | $table->text('...')->nullable() |
| Int | $table->integer('...') |
| Int @default(0) | $table->integer('...')->default(0) |
| Boolean @default(false) | $table->boolean('...')->default(false) |
| Boolean @default(true) | $table->boolean('...')->default(true) |
| DateTime @default(now()) | $table->timestamp('...')->useCurrent() |
| DateTime @updatedAt | $table->timestamp('...')->nullable() (managed by Eloquent) |
| DateTime | $table->timestamp('...') |
| DateTime? | $table->timestamp('...')->nullable() |
| Json | $table->json('...') |
| Json? | $table->json('...')->nullable() |

## Relationship Parity

| Prisma Relation | Eloquent Equivalent | onDelete |
|----------------|-------------------|----------|
| User hasOne Player | User::hasOne(Player) | Cascade |
| User hasOne Club | User::hasOne(Club) | Cascade |
| User hasOne Agent | User::hasOne(Agent) | Cascade |
| User hasOne Scout | User::hasOne(Scout) | Cascade |
| User hasOne Coach | User::hasOne(Coach) | Cascade |
| User hasOne Fan | User::hasOne(Fan) | Cascade |
| User hasOne Company | User::hasOne(Company) | Cascade |
| Player belongsTo User | Player::belongsTo(User) | Cascade |
| Player optional belongsTo Agent | Player::belongsTo(Agent) | SetNull |
| Club hasMany Coach | Club::hasMany(Coach) | — |
| Club hasMany Scout | Club::hasMany(Scout) | — |
| Player hasMany Video | Player::hasMany(Video) | Cascade |
| Video belongsToMany Tag via VideoTag | Video::belongsToMany(Tag) | Cascade |
| User hasMany Follows (as follower) | User::hasMany(Follow, 'followerId') | Cascade |
| User hasMany Follows (as followed) | User::hasMany(Follow, 'followedId') | Cascade |
| User hasMany Message (sent) | User::hasMany(Message, 'senderId') | Cascade |
| User hasMany Message (received) | User::hasMany(Message, 'receiverId') | Cascade |

## All models use UUID primary keys (parity with Prisma @default(uuid())).
