import { Router } from "express";
import upload from "../multer/upload";

import * as fileHandlerController from "../controllers/fileHandlerController";

const router = Router();

router.post("/upload", upload.single("file"), fileHandlerController.uploadFile);

router.get("/download", fileHandlerController.uploadFile);
