import multer from "multer";
import path from "path";
import fs from "fs";
import db from "../db/db";
import { type Request } from "express";

// Configure storage
const storage = multer.diskStorage({
  destination: async (req: Request & { user?: any }, file, cb) => {
    // Extract data from the request body
    const { contractId, itemId, type } = req.query;

    const userId = req.user?.id;

    const contractInfo = await db.contract.findUnique({
      where: { id: parseInt(contractId as string, 10) },
    });

    if (contractInfo) {
      if (contractInfo.sellerId !== parseInt(userId, 10)) {
        cb(new Error("Only seller can upload files)"), "");
      }
    }

    if (contractInfo === null) {
      cb(new Error("There is no contract for the given id"), "");
    }

    // Create a dynamic path
    const uploadPath = path.join(
      __dirname,
      "..",
      "uploads",
      "contracts",
      contractId as string,
      "items",
      itemId as string,
      type as string
    );

    // Remove everything inside if folder exists
    if (fs.existsSync(uploadPath)) {
      fs.rmSync(uploadPath, { recursive: true, force: true });
    }

    // Recreate an empty directory
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Make a unique filename to avoid collisions
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);

    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// Initialize Multer
const upload = multer({ storage });

export default upload;
