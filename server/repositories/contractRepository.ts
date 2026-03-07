import db from "../db/db";

export async function createContract(contract: {
  title: any;
  description: any;
  ownerId: any;
  sellerId: any;
  buyerId: any;
  endDate: null;
  amount: null;
  status: string;
}) {
  const newContract = await db.contract.create({
    data: contract,
  });

  return newContract;
}

export async function getContractById(contractId: number) {
  const contract = await db.contract.findUnique({
    where: {
      id: contractId,
    },
    include: {
      milestones: true,
      buyer: {
        select: { name: true },
      },
      seller: {
        select: { name: true },
      },
    },
  });

  return contract;
}

export async function getAllContractsOfUser(userId: number) {
  const contracts = await db.contract.findMany({
    where: {
      OR: [{ sellerId: userId }, { buyerId: userId }],
    },
    include: {
      buyer: {
        select: { name: true }, // Only fetch the needed fields
      },
      seller: {
        select: { name: true },
      },
    },
  });

  return contracts;
}

export async function updatePartner(
  contractId: number,
  data:
    | {
        sellerId: number | null;
      }
    | {
        buyerId: number | null;
      },
) {
  await db.contract.update({
    where: { id: contractId },
    data: data,
  });
}
