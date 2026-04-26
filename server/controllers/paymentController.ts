import express, { type Request, type Response } from "express";
import * as milestoneRepo from "../repositories/milestoneRepository";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function createPayment(req: Request, res: Response) {
  try {
    const milestoneId = req.body.milestoneId;
    const contractId = req.body.contractId;

    const milestoneInfo = await milestoneRepo.getMilestone(
      parseInt(contractId as string, 10),
      parseInt(milestoneId as string, 10),
    );

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
    res
      .status(500)
      .json({ error: error, code: "PAYMENT_ERROR", message: "payment failed" });
  }
}

export async function completePayment(req: Request, res: Response) {
  const milestoneId = req.body.milestoneId;
  const contractId = req.body.contractId;

  try {
    const milestoneInfo = milestoneRepo.updateMilestone(
      parseInt(contractId as string, 10),
      parseInt(milestoneId as string, 10),
      {
        isPayed: true,
      },
    );

    res.status(200).json({ message: "milestone updated" });
  } catch (error) {
    res.status(400).json({
      message: "failed to update the milestone",
      code: "MILESTONE_UPDATE_FAILED",
    });
  }
}
