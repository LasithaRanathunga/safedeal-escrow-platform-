import express from "express";
import type { NextFunction, Request, Response } from "express";
import { body } from "express-validator";
import validateRequest from "../middleware/validateRequest";
import db from "../db/db";
import { type milestone, type contract } from "@prisma/client";
import * as contractServices from "../services/contractServices";
import * as contractController from "../controllers/contractControllers";

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
  contractController.createContract,
);

router.post(
  "/createMilestone",
  milestoneValidators,
  validateRequest,
  contractController.createMilestone,
);

router.get("/getContract/:contractId", contractController.getContract);

router.get("/getAllContracts", contractController.getAllContracts);

router.post("/invitePartner", contractController.invitePartner);

export default router;
