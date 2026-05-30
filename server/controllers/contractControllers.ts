import type { Request, Response } from "express";
import * as contractRepo from "../repositories/contractRepository";
import * as contractServices from "../services/contractServices";
import * as userRepo from "../repositories/userRepository";
import db from "../db/db";
import { type milestone, type contract } from "@prisma/client";

export async function createContract(
  req: Request & { user?: any },
  res: Response,
) {
  const contract = {
    title: req.body.title,
    description: req.body.description,
    ownerId: req.user.id,
    sellerId: req.body.role === "seller" ? req.user.id : null,
    buyerId: req.body.role === "buyer" ? req.user.id : null,
    endDate: null,
    amount: null,
    status: "ACTIVE",
  };

  try {
    const newContract = await contractRepo.createContract(contract);

    return res.status(201).json({ contract: newContract });
  } catch (error) {
    return res.status(500).json({ message: "Error creating contract", error });
  }
}

export async function createMilestone(
  req: Request & { user?: any },
  res: Response,
) {
  try {
    const milestone = await contractServices.createMilestone(req.body);

    return res.status(201).json({
      milestone,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating milestone",
      error,
    });
  }
}

// export async function getContract(
//   req: Request & { user?: any },
//   res: Response,
// ) {
//   const contractId = req.params.contractId;

//   try {
//     const contract = await contractRepo.getContractById(
//       parseInt(contractId, 10),
//     );

//     if (!contract) {
//       return res.status(404).json({
//         status: "error",
//         code: "NO_CONTRACT_FOUND",
//         message: "Contract not found",
//       });
//     }

//     // Track the newest paid milestone order
//     let activeMilestone = 0;

//     if (contract.milestones.length > 0) {
//       for (const item of contract.milestones) {
//         if (item.isPayed && item.order > activeMilestone) {
//           activeMilestone = item.order;
//         }
//       }
//     }

//     const owner = await userRepo.getUserById(contract.ownerId);

//     // Check if current user is the owner
//     const isOwner = owner?.email === req.user.email;

//     // Add extra fields to contract response
//     const contractWithRole = {
//       ...contract,
//       isOwner: isOwner,
//       activeMilestone: activeMilestone,
//       role: undefined as string | undefined,
//     };

//     // Determine if current user is buyer or seller
//     if (contract.buyerId === parseInt(req.user.id, 10)) {
//       contractWithRole.role = "buyer";
//     } else if (contract.sellerId === parseInt(req.user.id, 10)) {
//       contractWithRole.role = "seller";
//     }

//     return res.status(200).json({ contract: contractWithRole });
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching contract", error });
//   }

//   // res.status(200).json({ message: "Fetch contract endpoint" });
// }

export async function getContract(
  req: Request & { user?: any },
  res: Response,
) {
  const contractId = Number(req.params.contractId);

  try {
    const contract = await contractServices.getContractDetails(
      contractId,
      req.user,
    );

    if (!contract) {
      return res.status(404).json({
        status: "error",
        code: "NO_CONTRACT_FOUND",
        message: "Contract not found",
      });
    }

    return res.status(200).json({ contract });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching contract",
      error,
    });
  }
}

// export async function getAllContracts(
//   req: Request & { user?: any },
//   res: Response,
// ) {
//   try {
//     const contracts = await contractRepo.getAllContractsOfUser(
//       parseInt(req.user.id, 10),
//     );

//     const contractsWithRole = contracts.map((contract: contract) => {
//       const contractWithRole = {
//         ...contract,
//         role: undefined as string | undefined,
//       };

//       if (contract.buyerId === parseInt(req.user.id, 10)) {
//         contractWithRole.role = "buyer";
//       } else if (contract.sellerId === parseInt(req.user.id, 10)) {
//         contractWithRole.role = "seller";
//       }
//       return contractWithRole;
//     });

//     return res.status(200).json({ contractsWithRole });
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching contracts", error });
//   }
// }

export async function getAllContracts(
  req: Request & { user?: any },
  res: Response,
) {
  try {
    const contracts = await contractServices.getUserContracts(req.user.id);

    return res.status(200).json({
      contracts,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error fetching contracts",
    });
  }
}

export async function invitePartner(
  req: Request & { user?: any },
  res: Response,
) {
  const { contractId, partnerEmail } = req.body;

  const partner = await userRepo.getUserByEmail(partnerEmail);

  const contract = await contractRepo.getContractById(parseInt(contractId, 10));

  if (!contract?.sellerId) {
    await contractRepo.updatePartner(parseInt(contractId, 10), {
      sellerId: partner?.id || null,
    });
  } else if (!contract.buyerId) {
    await contractRepo.updatePartner(parseInt(contractId, 10), {
      buyerId: partner?.id || null,
    });
  } else {
    return res.status(400).json({
      message: "Both buyer and seller are already assigned for this contract",
    });
  }

  return res.status(200).json({ message: "Partner invited successfully" });
}
