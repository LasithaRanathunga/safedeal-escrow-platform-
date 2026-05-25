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

export async function createMilestone(data: {
  title: string;
  description: string;
  amount: string;
  deadline: string;
  order: string;
  contractId: string;
}) {
  const { title, description, amount, deadline, order, contractId } = data;

  const parsedContractId = parseInt(contractId, 10);

  const parsedOrder = parseInt(order, 10);

  // here order means the position (sequence index) of a milestone within a specific contract
  // in this step of the transaction it Move all milestones in this contract that are at or after the new milestone's position one step forward. This creates space to insert the new milestone in the correct place.

  return db.$transaction(async (tx: TxClient) => {
    // shift later milestones
    await milestoneRepository.shiftMilestoneOrder(
      tx,
      parsedContractId,
      parsedOrder,
    );

    // insert new milestone
    const milestone = await milestoneRepository.createMilestone(tx, {
      title,
      description,
      amount: Number(amount),
      deadline: new Date(deadline),
      order: parsedOrder,
      contractId: parsedContractId,
    });

    // update totals
    await updateContractInfo(contractId, tx);

    return milestone;
  });
}
