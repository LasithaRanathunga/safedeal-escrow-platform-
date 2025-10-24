/*
  Warnings:

  - You are about to drop the column `buyer` on the `contract` table. All the data in the column will be lost.
  - You are about to drop the column `seller` on the `contract` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."contract" DROP COLUMN "buyer",
DROP COLUMN "seller",
ADD COLUMN     "buyerId" INTEGER,
ADD COLUMN     "sellerId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."contract" ADD CONSTRAINT "contract_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contract" ADD CONSTRAINT "contract_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
