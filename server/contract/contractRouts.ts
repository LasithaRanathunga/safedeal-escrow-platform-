import express from "express";
import type { NextFunction, Request, Response } from "express";
import { body } from "express-validator";
import validateRequest from "../middleware/validateRequest";
import db from "../db/db";
import { type milestone, type contract } from "@prisma/client";

const router = express.Router();

const contractValidators = [
  body("title").isString().notEmpty().withMessage("Title is required"),
  body("description")
    .isString()
    .notEmpty()
    .withMessage("Description is required"),
  body("role")
    .isIn(["buyer", "seller"])
    .withMessage("Role must be either 'buyer' or 'seller'"),
];

const milestoneValidators = [
  body("title").isString().notEmpty().withMessage("Title is required"),
  body("description")
    .isString()
    .notEmpty()
    .withMessage("Description is required"),
  body("amount")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be a number greater than 0"),
  body("deadline").isISO8601().toDate().withMessage("Deadline is required"),
  body("contractId")
    .isInt()
    .withMessage("Contract ID must be a positive integer"),
  body("order").isInt().withMessage("Order must be a positive integer"),
];

type TxClient = Parameters<Parameters<typeof db.$transaction>[0]>[0];

async function updateContractInfo(contractId: string, db: TxClient) {
  let milestones: milestone[];

  try {
    milestones = await db.milestone.findMany({
      where: { contractId: parseInt(contractId, 10) },
      orderBy: { deadline: "desc" }, // latest deadline first
    });
  } catch (error) {
    console.error("Error fetching milestones:", error);
    throw new Error("Error fetching milestones");
  }

  console.log("Fetched milestones:", milestones);

  // Total amount
  const totalAmount = milestones.reduce(
    (sum, milestone) => sum + milestone.amount,
    0
  );

  // Latest deadline
  const latestDeadline = milestones.length > 0 ? milestones[0].deadline : null;

  console.log("Total Amount:", totalAmount);
  console.log("Latest Deadline:", latestDeadline);

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
    console.error("Error updating contract:", error);
    throw new Error("Error updating contract");
  }
}

// Example route for creating a contract
router.post(
  "/create",
  contractValidators,
  validateRequest,
  async (req: Request & { user?: any }, res: Response) => {
    console.log("User making request:", req.body);

    try {
      console.log(typeof req.body.role);
      const newContract = await db.contract.create({
        data: {
          title: req.body.title,
          description: req.body.description,
          ownerId: req.user.id,
          sellerId: req.body.role === "seller" ? req.user.id : null,
          buyerId: req.body.role === "buyer" ? req.user.id : null,
          endDate: null,
          amount: null,
          status: "ACTIVE",
        },
      });

      return res.status(201).json({ contract: newContract });
    } catch (error) {
      console.error("Error creating contract:", error);
      return res
        .status(500)
        .json({ message: "Error creating contract", error });
    }
  }
);

router.post(
  "/createMilestone",
  milestoneValidators,
  validateRequest,
  async (req: Request & { user?: any }, res: Response) => {
    console.log("milestone making request:", req.body);

    const { title, description, amount, deadline, order, contractId } =
      req.body;

    try {
      await db.$transaction(async (tx) => {
        const increaseOrder = await tx.milestone.updateMany({
          where: {
            contractId: parseInt(contractId, 10),
            order: {
              gte: parseInt(order, 10),
            },
          },
          data: {
            order: {
              increment: 1,
            },
          },
        });

        const milestone = await tx.milestone.create({
          data: {
            title,
            description,
            amount: Number(amount),
            deadline: new Date(deadline),
            order,
            contractId: parseInt(contractId, 10),
          },
        });

        try {
          await updateContractInfo(contractId, tx);
        } catch (error) {
          console.error("Error updating contract info:", error);
          throw new Error("Error updating contract info");
        }

        res.status(201).json({ milestone });
      });
    } catch (error) {
      console.error("Error creating milestone:", error);
      return res
        .status(500)
        .json({ message: "Error creating milestone", error });
    }
  }
);

router.get(
  "/getContract/:contractId",
  async (req: Request & { user?: any }, res: Response) => {
    console.log("Fetching contract with ID:", req.params.contractId);

    const contractId = req.params.contractId;

    try {
      const contract = await db.contract.findUnique({
        where: {
          id: parseInt(contractId, 10),
        },
        include: {
          milestones: true,
        },
      });

      if (!contract) {
        return res.status(404).json({
          status: "error",
          code: "NO_CONTRACT_FOUND",
          message: "Contract not found",
        });
      }

      const contractWithRole = {
        ...contract,
        role: undefined as string | undefined,
      };

      if (contract.buyerId === parseInt(req.user.id, 10)) {
        contractWithRole.role = "buyer";
      } else if (contract.sellerId === parseInt(req.user.id, 10)) {
        contractWithRole.role = "seller";
      }

      console.log("Fetched contract:", contract.sellerId, "user", req.user.id);

      return res.status(200).json({ contract: contractWithRole });
    } catch (error) {
      console.error("Error fetching contract:", error);
      res.status(500).json({ message: "Error fetching contract", error });
    }

    // res.status(200).json({ message: "Fetch contract endpoint" });
  }
);

router.get(
  "/getAllContracts",
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const contracts = await db.contract.findMany({
        where: {
          OR: [
            { sellerId: parseInt(req.user.id, 10) },
            { buyerId: parseInt(req.user.id, 10) },
          ],
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

      const contractsWithRole = contracts.map((contract: contract) => {
        const contractWithRole = {
          ...contract,
          role: undefined as string | undefined,
        };

        if (contract.buyerId === parseInt(req.user.id, 10)) {
          contractWithRole.role = "buyer";
        } else if (contract.sellerId === parseInt(req.user.id, 10)) {
          contractWithRole.role = "seller";
        }
        return contractWithRole;
      });

      return res.status(200).json({ contractsWithRole });
    } catch (error) {
      console.error("Error fetching contracts:", error);
      res.status(500).json({ message: "Error fetching contracts", error });
    }
  }
);

export default router;
