import { Router } from "express";
import upload from "../multer/upload";
import db from "../db/db";
import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import archiver from "archiver";
import crypto from "crypto";

const router = Router();

router.post(
  "/upload",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const { contractId, itemId, type } = req.query;
      const filePath = req.file?.path;
      console.log("File path:", type);

      if (!filePath) {
        return res.status(400).json({ error: "File not uploaded properly" });
      }

      if (type === "preview") {
        const savedFile = await db.milestone.update({
          where: {
            contractId_order: {
              contractId: parseInt(contractId as string, 10),
              order: parseInt(itemId as string, 10),
            },
          },
          data: {
            previewPath: filePath,
            previewDate: new Date(),
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
            finalDate: new Date(),
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
  }
);

router.get(
  "/download",
  async (req: Request & { user?: any }, res: Response) => {
    const { contractId, itemId, type } = req.query as {
      contractId: string;
      itemId: string;
      type: string;
    };

    let isUserBuyer = false;

    try {
      const contract = await db.contract.findUnique({
        where: { id: parseInt(contractId, 10) },
      });

      if (contract && contract.buyerId === req.user.id) {
        isUserBuyer = true;
      }
    } catch (err) {
      res.status(400).json({
        code: "USER_NOT_FOUND",
        message: "current user does not exist in the database",
      });
    }

    if (isUserBuyer) {
      const folderPath = path.join(
        __dirname,
        "..",
        "uploads",
        "contracts",
        contractId as string,
        "items",
        itemId as string,
        type as string
      );

      if (!fs.existsSync(folderPath)) {
        return res.status(404).json({
          code: "FOLDER_NOT_FOUND",
          message: "No files found to download",
        });
      }

      // Generate a random unique file name
      const randomName = `${crypto.randomBytes(8).toString("hex")}.zip`;
      const zipFilePath = path.join(__dirname, "downloads", randomName);

      // Check if the folder exists, if not create it
      const downloadsDir = path.join(__dirname, "downloads");

      if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
      }

      // Create a file to stream archive data to
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      // When the archive is finalized, send the zip file
      output.on("close", () => {
        res.download(zipFilePath, (err) => {
          if (err) console.error("Download error:", err);

          // Optional: clean up after download
          fs.unlinkSync(zipFilePath);
        });
      });

      // Handle archive errors
      archive.on("error", (err) => {
        res.status(500).send({ message: err.message, code: "ARCHIVE_ERROR" });
      });

      // Pipe archive data to the output file
      archive.pipe(output);

      // Append files from the folder
      archive.directory(folderPath, false);

      // Finalize the archive (this starts zipping)
      archive.finalize();
    }
  }
);

export default router;
