import fs from "fs";
import path from "path";
import archiver from "archiver";
import crypto from "crypto";

import * as contractRepository from "../repositories/contractRepository";
import * as milestoneRepository from "../repositories/milestoneRepository";

export async function uploadFile(data: {
  contractId: number;
  itemId: number;
  type: string;
  filePath: string;
}) {
  if (data.type === "preview") {
    return milestoneRepository.updateMilestone(data.contractId, data.itemId, {
      previewPath: data.filePath,
      previewDate: new Date(),
    });
  }

  if (data.type === "final") {
    return milestoneRepository.updateMilestone(data.contractId, data.itemId, {
      finalPath: data.filePath,
      finalDate: new Date(),
    });
  }

  throw new Error("Invalid upload type");
}

function buildDownloadFolderPath(
  contractId: number,
  itemId: number,
  type: string,
) {
  return path.join(
    __dirname,
    "..",
    "uploads",
    "contracts",
    contractId.toString(),
    "items",
    itemId.toString(),
    type,
  );
}

async function createZipArchive(folderPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const downloadsDir = path.join(__dirname, "..", "downloads");

    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, {
        recursive: true,
      });
    }

    const zipName = `${crypto.randomBytes(8).toString("hex")}.zip`;

    const zipFilePath = path.join(downloadsDir, zipName);

    const output = fs.createWriteStream(zipFilePath);

    const archive = archiver("zip", {
      zlib: {
        level: 9,
      },
    });

    output.on("close", () => {
      resolve(zipFilePath);
    });

    archive.on("error", (err) => {
      reject(err);
    });

    archive.pipe(output);

    archive.directory(folderPath, false);

    archive.finalize();
  });
}

export async function prepareDownload(data: {
  contractId: number;
  itemId: number;
  type: string;
  userId: number;
}) {
  const contract = await contractRepository.getContractById(data.contractId);

  if (!contract) {
    throw {
      statusCode: 404,
      code: "CONTRACT_NOT_FOUND",
      message: "Contract not found",
    };
  }

  if (contract.buyerId !== data.userId) {
    throw {
      statusCode: 403,
      code: "UNAUTHORIZED",
      message: "You are not allowed to download these files",
    };
  }

  const folderPath = buildDownloadFolderPath(
    data.contractId,
    data.itemId,
    data.type,
  );

  if (!fs.existsSync(folderPath)) {
    throw {
      statusCode: 404,
      code: "FOLDER_NOT_FOUND",
      message: "No files found to download",
    };
  }

  const zipFilePath = await createZipArchive(folderPath);

  return {
    zipFilePath,

    cleanup() {
      if (fs.existsSync(zipFilePath)) {
        fs.unlinkSync(zipFilePath);
      }
    },
  };
}
