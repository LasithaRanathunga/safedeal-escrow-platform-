import express from "express";
import type { Request, Response } from "express";
import { body } from "express-validator";
import type { ValidationChain } from "express-validator";
import bcrypt from "bcrypt";

import db from "../db/db";

const router = express.Router();

const signupValidator: ValidationChain[] = [
  body("email").notEmpty().trim().isEmail().withMessage("Invalid email format"),
  body("fullname").notEmpty().trim().withMessage("Full name is requred"),
  body("password")
    .notEmpty()
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("confirmpassword")
    .notEmpty()
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

router.post("/signup", signupValidator, async (req: Request, res: Response) => {
  if (req.body.password !== req.body.confirmpassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

  try {
    const createdUser = await db.user.create({
      data: {
        email: req.body.email,
        name: req.body.fullname,
        password: hashedPassword,
      },
    });

    console.log(createdUser);
  } catch (error) {
    return res.status(500).json({ message: "Error creating user", error });
  }
});

export default router;
