import db from "../db/db";
import { type milestone, type contract } from "@prisma/client";

type TxClient = Parameters<Parameters<typeof db.$transaction>[0]>[0];

export async function updateContractInfo(contractId: string, db: TxClient) {
  let milestones: milestone[];

  try {
    milestones = await db.milestone.findMany({
      where: { contractId: parseInt(contractId, 10) },
      orderBy: { deadline: "desc" }, // latest deadline first
    });
  } catch (error) {
    throw new Error("Error fetching milestones");
  }

  // Total amount
  const totalAmount = milestones.reduce(
    (sum, milestone) => sum + milestone.amount,
    0,
  );

  // Latest deadline
  const latestDeadline = milestones.length > 0 ? milestones[0].deadline : null;

  // Update contract
  try {
    await db.contract.update({
      where: { id: parseInt(contractId, 10) },
      data: {
        amount: totalAmount,
        endDate: latestDeadline,
      },
    });
  } catch (error) {
    throw new Error("Error updating contract");
  }
}
