import express from "express";
import type { Request, Response } from "express";
import { body } from "express-validator";
import type { ValidationChain } from "express-validator";
import bcrypt from "bcrypt";
import "dotenv/config";

import {
  getAccessToken,
  createRefreshToken,
  authenticateToken,
  getTokenExpiry,
} from "../services/authServices";

import { signUp } from "../controllers/authController";

import db from "../db/db";

const router = express.Router();

type User = {
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  id: number;
};

// define validation schema for signup
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

router.post("/signup", signupValidator, signUp);

// ######### Login Route #########
router.post("/login", async (req: Request, res: Response) => {
  console.log("Login request body:", req.body);
  const email = req.body.email;
  const password = req.body.password;

  const user = await db.user.findUnique({
    where: { email: email },
  });

  console.log("Found user:", user);

  if (!user) {
    console.log("User not found");
    return res.status(400).json({ message: "User not found" });
  } else {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Invalid email or password");
      return res.status(400).json({ message: "Invalid email or password" });
    }
  }

  // delete refresh token if exist
  await db.refreshToken.deleteMany({ where: { userId: user.id } });

  //create tokens
  const refreshToken = await createRefreshToken(user, "7d");
  const accessToken = await getAccessToken(user, refreshToken);

  // send tokens to the client
  res.status(200).json({ accessToken, refreshToken });
});

// ######### LogOut Route #########
router.post(
  "/logout",
  authenticateToken,
  async (req: Request & { user?: any }, res: Response) => {
    const email = req.user.email;
    console.log("Logout called");
    console.log("from logout", email);
    const user = await db.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const userId = user.id;

    // delete refresh tokens associated with the user
    try {
      await db.refreshToken.delete({
        where: { userId: userId },
      });
    } catch (error) {
      return res.status(500).json({ message: "Error in logging out", error });
    }

    res.status(200).json({ message: "Logged out successfully" });
  },
);

// ######### Re-New Access Token #########
router.post("/renew-token", async (req: Request, res: Response) => {
  const refreshToken = req.body.refreshToken;
  console.log("Refresh Token:", refreshToken);
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  // verify refresh token
  try {
    const decoded = await db.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!decoded) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const user = await db.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const accessToken = await getAccessToken(user, refreshToken);

    res.status(200).json({ accessToken });
  } catch (error) {
    return res.status(500).json({ message: "Error verifying token", error });
  }
});

export default router;
