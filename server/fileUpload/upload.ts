import { Router } from "express";
import upload from "../multer/upload";
import db from "../db/db";

const router = Router();

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { contractId, itemId, type } = req.query;
    const filePath = req.file?.path;
    console.log("File path:", type);

    if (!filePath) {
      return res.status(400).json({ error: "File not uploaded properly" });
    }

    // Save metadata in DB

    if (type === "preview") {
      const savedFile = await db.milestone.update({
        where: {
          contractId_order: {
            contractId: parseInt(contractId as string, 10),
            order: parseInt(itemId as string, 10),
          },
        },
        data: {
          reviewPath: filePath,
        },
      });
    } else if (type === "final") {
      const savedFile = await db.milestone.update({
        where: {
          contractId_order: {
            contractId: parseInt(contractId as string, 10),
            order: parseInt(itemId as string, 10),
          },
        },
        data: {
          finalPath: filePath,
        },
      });
    }

    res.status(200).json({
      message: "File uploaded successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
