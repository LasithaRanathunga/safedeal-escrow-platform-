import express from "express";
import type { NextFunction, Request, Response } from "express";
import { body } from "express-validator";
import validateRequest from "../middleware/validateRequest";
import db from "../db/db";

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
          seller: req.body.role === "seller" ? req.user.id : null,
          buyer: req.body.role === "buyer" ? req.user.id : null,
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
  (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    console.log("User making request:", req.user);
    next();
  },
  milestoneValidators,
  validateRequest,
  async (req: Request & { user?: any }, res: Response) => {
    console.log("milestone making request:", req.body);

    const { title, description, amount, deadline, order, contractId } =
      req.body;

    try {
      const milestone = await db.milestone.create({
        data: {
          title,
          description,
          amount: Number(amount),
          deadline: new Date(deadline),
          order,
          contractId,
        },
      });

      res.status(201).json({ milestone });
    } catch (error) {
      console.error("Error creating milestone:", error);
      return res
        .status(500)
        .json({ message: "Error creating milestone", error });
    }
  }
);

export default router;
