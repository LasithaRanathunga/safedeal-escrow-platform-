import { Router, type Request, type Response } from "express";
import * as userRepo from "../repositories/userRepository";
import { type User } from "../generated/prisma";

export async function searchByUsername(
  req: Request & { user?: any },
  res: Response,
) {
  try {
    const users = await userRepo.getUserByName(req.body.name);

    // remove the requesting user from the results
    const filteredUsers = users.filter((user: User) => {
      if (user.email !== req.user.email) {
        return user;
      }
    });

    return res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error searching users:", error);
    return res.status(500).json({ message: "Error searching users", error });
  }
}

export async function getCurrentUser(
  req: Request & { user?: any },
  res: Response,
) {
  try {
    const user = await userRepo.getUserByEmail(req.user.email);

    return res.status(200).json({ name: user?.name, email: user?.email });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching current user",
      code: "NO_USER_FOUND",
      error,
    });
  }
}
