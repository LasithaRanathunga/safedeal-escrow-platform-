/*
  Warnings:

  - You are about to drop the column `refreshTokenId` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `milestone` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId]` on the table `refreshToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `refreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."milestone" DROP CONSTRAINT "milestone_contractId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user" DROP CONSTRAINT "user_refreshTokenId_fkey";

-- AlterTable
ALTER TABLE "public"."refreshToken" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "refreshTokenId";

-- DropTable
DROP TABLE "public"."milestone";

-- CreateIndex
CREATE UNIQUE INDEX "refreshToken_userId_key" ON "public"."refreshToken"("userId");

-- AddForeignKey
ALTER TABLE "public"."refreshToken" ADD CONSTRAINT "refreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
