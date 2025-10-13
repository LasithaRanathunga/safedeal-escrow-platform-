/*
  Warnings:

  - You are about to drop the `Milestone` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Milestone" DROP CONSTRAINT "Milestone_contractId_fkey";

-- DropTable
DROP TABLE "public"."Milestone";

-- CreateTable
CREATE TABLE "public"."milestone" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "order" INTEGER NOT NULL,
    "contractId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milestone_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."milestone" ADD CONSTRAINT "milestone_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "public"."contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
