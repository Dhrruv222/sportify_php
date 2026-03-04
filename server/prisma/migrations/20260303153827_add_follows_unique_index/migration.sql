/*
  Warnings:

  - A unique constraint covering the columns `[followerId,followedId]` on the table `Follows` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Follows_followerId_followedId_key" ON "Follows"("followerId", "followedId");
