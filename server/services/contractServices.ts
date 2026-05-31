import db from "../db/db";
import { type milestone, type contract } from "@prisma/client";
import * as milestoneRepository from "../repositories/milestoneRepository";
import * as contractRepository from "../repositories/contractRepository";
import * as userRepository from "../repositories/userRepository";

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

function getActiveMilestone(
  milestones: {
    order: number;
    isPayed: boolean;
  }[],
) {
  let activeMilestone = 0;

  for (const milestone of milestones) {
    if (milestone.isPayed && milestone.order > activeMilestone) {
      activeMilestone = milestone.order;
    }
  }

  return activeMilestone;
}

function getUserRole(
  contract: {
    buyerId: number | null;
    sellerId: number | null;
  },
  userId: string,
) {
  const parsedId = Number(userId);

  if (contract.buyerId === parsedId) {
    return "buyer";
  }

  if (contract.sellerId === parsedId) {
    return "seller";
  }

  return undefined;
}

type CurrentUser = {
  id: string;
  email: string;
};

export async function getContractDetails(
  contractId: number,
  currentUser: CurrentUser,
) {
  const contract = await contractRepository.getContractById(contractId);

  if (!contract) {
    return null;
  }

  const owner = await userRepository.getUserById(contract.ownerId);

  const activeMilestone = getActiveMilestone(contract.milestones);

  const isOwner = owner?.email === currentUser.email;

  const role = getUserRole(contract, currentUser.id);

  return {
    ...contract,
    isOwner,
    activeMilestone,
    role,
  };
}

export async function getUserContracts(userId: string) {
  const contracts = await contractRepository.getAllContractsOfUser(
    Number.parseInt(userId, 10),
  );

  return contracts.map((contract) => ({
    ...contract,
    role: getUserRole(contract, userId),
  }));
}

export async function invitePartner(contractId: number, partnerEmail: string) {
  const partner = await userRepository.getUserByEmail(partnerEmail);

  if (!partner) {
    throw new Error("Partner not found");
  }

  const contract = await contractRepository.getContractById(contractId);

  if (!contract) {
    throw new Error("Contract not found");
  }

  if (partner.id === contract.ownerId) {
    throw new Error("Owner cannot be invited as a partner");
  }

  if (!contract.sellerId) {
    await contractRepository.updatePartner(contractId, {
      sellerId: partner.id,
    });

    return;
  }

  if (!contract.buyerId) {
    await contractRepository.updatePartner(contractId, {
      buyerId: partner.id,
    });

    return;
  }

  throw new Error(
    "Both buyer and seller are already assigned for this contract",
  );
}
