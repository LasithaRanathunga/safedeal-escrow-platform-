import jwt from "jsonwebtoken";
import "dotenv/config";
import type { Request, Response, NextFunction } from "express";
import db from "../db/db";
import User from "../models/User";
import bcrypt from "bcrypt";
import * as userRepo from "../repositories/userRepository";
import * as refreshTokenRepo from "../repositories/refreshTokenRepository";

type JwtPayload = {
  email: string;
  name: string;
};

const accessSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

export async function createUser(
  email: string,
  name: string,
  password: string,
) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = await userRepo.createUser(email, name, hashedPassword);

  return user;
}

export async function ifRefrechTokenExists(token: string) {
  const refreshToken = await refreshTokenRepo.getRefreshToken(token);

  return refreshToken ? true : false;
}

// create refresh token and store it in the refreshToken table
export async function createRefreshToken(user: JwtPayload, expiresIn: string) {
  const { name, email } = user;

  const refreshToken = jwt.sign(
    { name: name, email: email },
    refreshSecret as string,
    { expiresIn: "7d" },
  );

  const userData = await userRepo.getUserByEmail(email);

  if (userData) {
    try {
      const refresh = await refreshTokenRepo.createRefreshToken(
        refreshToken,
        userData.id,
        getTokenExpiry(expiresIn),
      );
    } catch (error) {
      console.error("Error storing refresh token:", error);
    }
  }

  return refreshToken;
}

export async function getAccessToken(user: JwtPayload, refreshToken: string) {
  const isRefreshTokenValid: boolean = await ifRefrechTokenExists(refreshToken);

  if (!isRefreshTokenValid) {
    throw new Error("Invalid refresh token");
  } else {
    const accessToken = jwt.sign(
      { name: user.name, email: user.email },
      accessSecret as string,
      { expiresIn: "15m" },
    );

    return accessToken;
  }
}

export function removeRefreshToken(token: string) {
  // remove refresh token from the database
  try {
    db.refreshToken.delete({ where: { token: token } });
  } catch (error) {
    console.error("Error removing refresh token:", error);
  }
}

// gives the epiry date of a token based on the duration string
export function getTokenExpiry(duration: string): Date {
  const now = Date.now();
  const regex = /^(\d+)([smhd])$/; // supports seconds, minutes, hours, days
  const match = duration.match(regex);

  if (!match) {
    throw new Error("Invalid duration format. Use like '15m', '2h', '7d'.");
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  let ms = 0;
  switch (unit) {
    case "s":
      ms = value * 1000;
      break;
    case "m":
      ms = value * 60 * 1000;
      break;
    case "h":
      ms = value * 60 * 60 * 1000;
      break;
    case "d":
      ms = value * 24 * 60 * 60 * 1000;
      break;
  }

  return new Date(now + ms);
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  // Check for missing OR "null"/empty token
  if (!token || token === "null" || token.trim() === "") {
    return res.status(401).json({
      status: "error",
      code: "NO_TOKEN",
      message: "No token has been sent",
    });
  }

  jwt.verify(token, accessSecret as string, async (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          status: "error",
          code: "TOKEN_EXPIRED",
          message: "Access token has expired",
        });
      }

      return res.status(401).json({
        status: "error",
        code: "INVALID_TOKEN",
        message: "Access token is invalid",
      });
    }

    // get user data from the database
    const userData = await db.user.findUnique({
      where: { email: (user as JwtPayload).email },
    });

    if (userData) {
      const user = new User(userData.id, userData.name, userData.email);
      (req as any).user = user;
      next();
    } else {
      return res.status(401).json({
        status: "error",
        code: "USER_NOT_FOUND",
        message: "User not found",
      });
    }
  });
}
