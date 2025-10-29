/*
  Warnings:

  - You are about to drop the column `previewdate` on the `milestone` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."milestone" DROP COLUMN "previewdate",
ADD COLUMN     "previewDate" TIMESTAMP(3);
