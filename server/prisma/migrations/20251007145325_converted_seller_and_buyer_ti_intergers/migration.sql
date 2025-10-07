/*
  Warnings:

  - The `seller` column on the `contract` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `buyer` column on the `contract` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."contract" DROP COLUMN "seller",
ADD COLUMN     "seller" INTEGER,
DROP COLUMN "buyer",
ADD COLUMN     "buyer" INTEGER;
