import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import db from "../db/db";
import User from "../models/User";

const accessSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

type JwtPayload = {
  email: string;
  name: string;
};

export default function authenticateToken(
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
