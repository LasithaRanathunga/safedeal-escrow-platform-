import { Router, type Request, type Response } from "express";
import * as userController from "../controllers/userControllers";

const router = Router();

router.post("/searchByUsername", userController.searchByUsername);

router.get("/getCurrentUser", userController.getCurrentUser);

export default router;
