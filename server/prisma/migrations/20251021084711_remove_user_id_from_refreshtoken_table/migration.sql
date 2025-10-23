/*
  Warnings:

  - You are about to drop the column `userId` on the `refreshToken` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."refreshToken" DROP CONSTRAINT "refreshToken_userId_fkey";

-- DropIndex
DROP INDEX "public"."refreshToken_userId_key";

-- AlterTable
ALTER TABLE "public"."refreshToken" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "refreshTokenId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."user" ADD CONSTRAINT "user_refreshTokenId_fkey" FOREIGN KEY ("refreshTokenId") REFERENCES "public"."refreshToken"("id") ON DELETE SET NULL ON UPDATE CASCADE;
