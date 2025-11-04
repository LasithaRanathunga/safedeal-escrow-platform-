import express, { type Request, type Response } from "express";
import db from "../db/db";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

router.post("/create-payment", async (req: Request, res: Response) => {
  try {
    const milestoneId = req.body.milestoneId;

    const milestoneInfo = await db.milestone.findUnique({
      where: { id: parseInt(milestoneId, 10) },
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

export default router;
