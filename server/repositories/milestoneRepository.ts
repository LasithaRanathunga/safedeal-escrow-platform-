import db from "../db/db";

type TxClient = Parameters<Parameters<typeof db.$transaction>[0]>[0];

export async function getMilestone(contractId: number, milestoneId: number) {
  const milestoneInfo = await db.milestone.findUnique({
    where: {
      contractId_order: {
        contractId: contractId,
        order: milestoneId,
      },
    },
  });

  return milestoneInfo;
}

export async function updateMilestone(
  contractId: number,
  milestoneId: number,
  data: object,
) {
  const milestoneInfo = await db.milestone.update({
    where: {
      contractId_order: {
        contractId: contractId,
        order: milestoneId,
      },
    },
    // data: {
    //   isPayed: true,
    // },
    data: data,
  });

  return milestoneId;
}

export async function getMilestonesOfContract(
  contractId: number,
  sortOrder: "asc" | "desc" = "asc",
) {
  const milestones = await db.milestone.findMany({
    where: {
      contractId: contractId,
    },
    orderBy: {
      order: sortOrder,
    },
  });

  return milestones;
}

export async function shiftMilestoneOrder(
  tx: TxClient,
  contractId: number,
  order: number,
) {
  return tx.milestone.updateMany({
    where: {
      contractId,
      order: {
        gte: order,
      },
    },
    data: {
      order: {
        increment: 1,
      },
    },
  });
}

export async function createMilestone(
  tx: TxClient,
  data: {
    title: string;
    description: string;
    amount: number;
    deadline: Date;
    order: number;
    contractId: number;
  },
) {
  return tx.milestone.create({
    data,
  });
}
