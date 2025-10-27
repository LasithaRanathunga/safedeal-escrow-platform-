/*
  Warnings:

  - A unique constraint covering the columns `[contractId,order]` on the table `milestone` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "milestone_contractId_order_key" ON "public"."milestone"("contractId", "order");
