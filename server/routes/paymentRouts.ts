import express from "express";

import * as paymentController from "../controllers/paymentController";

const router = express.Router();

router.post("/create-payment", paymentController.createPayment);

router.post("/complete-payment", paymentController.completePayment);
