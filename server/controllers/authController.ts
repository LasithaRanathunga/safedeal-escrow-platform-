import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import db from "../db/db";
import {
  getAccessToken,
  createRefreshToken,
  authenticateToken,
  getTokenExpiry,
} from "../services/authServices";
import * as userService from "../services/authServices";

type User = {
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  id: number;
};

export async function signUp(req: Request, res: Response) {
  if (req.body.password !== req.body.confirmpassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  let user: User;

  try {
    user = await userService.createUser(
      req.body.email,
      req.body.fullname,
      req.body.password,
    );
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error: user creation failed", error });
  }

  const refreshToken = await createRefreshToken(user, "7d");
  const accessToken = await getAccessToken(user, refreshToken);

  res.status(201).json({ accessToken, refreshToken });
}
