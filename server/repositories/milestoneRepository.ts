import db from "../db/db";

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
    data: {
      isPayed: true,
    },
  });

  return milestoneId;
}
