import express from "express";
import type { Request, Response } from "express";
import { body } from "express-validator";

import db from "../db/db";

const router = express.Router();

// Example route for creating a contract
router.post("/create", async (req: Request & { user?: any }, res) => {
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
    return res.status(500).json({ message: "Error creating contract", error });
  }
});

export default router;
