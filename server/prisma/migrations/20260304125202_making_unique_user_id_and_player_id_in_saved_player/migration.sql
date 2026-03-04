/*
  Warnings:

  - A unique constraint covering the columns `[userId,playerId]` on the table `SavedPlayer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SavedPlayer_userId_playerId_key" ON "SavedPlayer"("userId", "playerId");
