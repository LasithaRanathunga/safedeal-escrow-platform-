import express, { type Request, type Response } from "express";
import * as paymentController from "../controllers/paymentController";
import db from "../db/db";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

router.post("/create-payment", paymentController.createPayment);

router.post("/complete-payment", paymentController.completePayment);

export default router;
