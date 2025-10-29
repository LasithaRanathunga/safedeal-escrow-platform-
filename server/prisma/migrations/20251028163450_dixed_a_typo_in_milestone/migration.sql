/*
  Warnings:

  - You are about to drop the column `reviewPath` on the `milestone` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."milestone" DROP COLUMN "reviewPath",
ADD COLUMN     "previewPath" TEXT;
