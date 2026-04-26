import express from "express";
import { body } from "express-validator";
import type { ValidationChain } from "express-validator";
import "dotenv/config";

import authenticateToken from "../middleware/authenticateTokenMiddleware";

import {
  signUp,
  logIn,
  logOut,
  renewToken,
} from "../controllers/authController";

const router = express.Router();

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

router.post("/login", logIn);

router.post("/logout", authenticateToken, logOut);

router.post("/renew-token", renewToken);

export default router;
