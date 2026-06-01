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

  try {
    await contractServices.invitePartner(Number(contractId), partnerEmail);

    return res.status(200).json({
      message: "Partner invited successfully",
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error inviting partner",
    });
  }
}
