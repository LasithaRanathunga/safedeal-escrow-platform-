import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import * as authServices from "../services/authServices";
import * as userRepo from "../repositories/userRepository";
import * as refreshTokenRepo from "../repositories/refreshTokenRepository";

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
    user = await authServices.createUser(
      req.body.email,
      req.body.fullname,
      req.body.password,
    );
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error: user creation failed", error });
  }

  const refreshToken = await authServices.createRefreshToken(user, "7d");
  const accessToken = await authServices.getAccessToken(user, refreshToken);

  res.status(201).json({ accessToken, refreshToken });
}

export async function logIn(req: Request, res: Response) {
  const email = req.body.email;
  const password = req.body.password;

  const user = await userRepo.getUserByEmail(email);

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  } else {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
  }

  // delete refresh token if exist
  await userRepo.deleteManyTokensOfUserId(user.id);

  //create tokens
  const refreshToken = await authServices.createRefreshToken(user, "7d");
  const accessToken = await authServices.getAccessToken(user, refreshToken);

  // send tokens to the client
  res.status(200).json({ accessToken, refreshToken });
}

export async function logOut(req: Request & { user?: any }, res: Response) {
  const email = req.user.email;

  const user = await userRepo.getUserByEmail(email);

  if (!user) {
    return res.status(400).json({ message: "Invalid email" });
  }

  const userId = user.id;

  // delete refresh tokens associated with the user
  try {
    await refreshTokenRepo.deleteRefreshTokenOfUserId(userId);
  } catch (error) {
    return res.status(500).json({ message: "Error in logging out", error });
  }

  res.status(200).json({ message: "Logged out successfully" });
}

export async function renewToken(req: Request, res: Response) {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  try {
    const decoded = await refreshTokenRepo.getRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const user = await userRepo.getUserById(decoded.userId);

    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const accessToken = await authServices.getAccessToken(
      { email: user.email, name: user.name },
      refreshToken,
    );

    res.status(200).json({ accessToken });
  } catch (error) {
    return res.status(500).json({ message: "Error verifying token", error });
  }
}
