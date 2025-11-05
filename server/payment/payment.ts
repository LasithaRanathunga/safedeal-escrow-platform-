import express, { type Request, type Response } from "express";
import db from "../db/db";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

router.post("/create-payment", async (req: Request, res: Response) => {
  try {
    const milestoneId = req.body.milestoneId;
    const contractId = req.body.contractId;

    const milestoneInfo = await db.milestone.findUnique({
      where: {
        contractId_order: {
          contractId: parseInt(contractId as string, 10),
          order: parseInt(milestoneId as string, 10),
        },
      },
    });

    if (!milestoneInfo) {
      return res.status(500).json({
        message: "Milestone can not fild in the database",
        code: "MILESTONE_CAN_NOT_FIND",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: milestoneInfo.amount * 100,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: error, code: "PAYMENT_ERROR", message: "payment failed" });
  }
});

router.post("/complete-payment", async (req: Request, res: Response) => {
  const milestoneId = req.body.milestoneId;
  const contractId = req.body.contractId;

  try {
    const milestoneInfo = await db.milestone.update({
      where: {
        contractId_order: {
          contractId: parseInt(contractId as string, 10),
          order: parseInt(milestoneId as string, 10),
        },
      },
      data: {
        isPayed: true,
      },
    });

    console.log("updated milestone", milestoneInfo);

    res.status(200).json({ message: "milestone updated" });
  } catch (error) {
    res.status(400).json({
      message: "failed to update the milestone",
      code: "MILESTONE_UPDATE_FAILED",
    });
  }
});

export default router;
