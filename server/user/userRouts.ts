import { Router, type Request, type Response } from "express";
import db from "../db/db";
import { type User } from "../generated/prisma";

const router = Router();

router.post(
  "/searchByUsername",
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const users = await db.user.findMany({
        where: {
          name: {
            contains: req.body.name,
            mode: "insensitive",
          },
        },
      });

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
);

export default router;
