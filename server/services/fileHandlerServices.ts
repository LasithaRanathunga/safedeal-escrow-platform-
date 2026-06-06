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
