import express from "express";
import type { Request, Response } from "express";
import { body } from "express-validator";

const router = express.Router();

// Example route for creating a contract
router.post("/create", (req: Request & { user?: any }, res) => {
  console.log("called");
  console.log(req.body);
  console.log(req.user);
  const { title, description, parties } = req.body;

  res.json({ message: "Contract created successfully", contract: req.body });
});

export default router;
