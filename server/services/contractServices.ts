import db from "../db/db";
import { type milestone, type contract } from "@prisma/client";
import * as milestoneRepository from "../repositories/milestoneRepository";
import * as contractRepository from "../repositories/contractRepository";

type TxClient = Parameters<Parameters<typeof db.$transaction>[0]>[0];

export async function updateContractInfo(contractId: string, db: TxClient) {
  let milestones: milestone[];

  try {
    milestones = await milestoneRepository.getMilestonesOfContract(
      parseInt(contractId, 10),
      "desc",
    );
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
    await contractRepository.updateContract(parseInt(contractId, 10), {
      amount: totalAmount,
      endDate: latestDeadline,
    });
  } catch (error) {
    throw new Error("Error updating contract");
  }
}
