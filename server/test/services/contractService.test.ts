import { describe, it, expect, vi, beforeEach } from "vitest";
import * as milestoneRepository from "../../repositories/milestoneRepository";
import * as contractRepository from "../../repositories/contractRepository";
import * as contractServices from "../../services/contractServices";

vi.mock("../../repositories/milestoneRepository");
vi.mock("../../repositories/contractRepository");

describe("updateContractInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should calculate total amount and latest deadline and update contract", async () => {
    const milestones = [
      {
        amount: 300,
        deadline: new Date("2026-06-30"),
      },
      {
        amount: 200,
        deadline: new Date("2026-06-15"),
      },
      {
        amount: 100,
        deadline: new Date("2026-06-01"),
      },
    ];

    vi.mocked(milestoneRepository.getMilestonesOfContract).mockResolvedValue(
      milestones as any,
    );

    vi.mocked(contractRepository.updateContract).mockResolvedValue({} as any);

    await contractServices.updateContractInfo("1", {} as any);

    expect(milestoneRepository.getMilestonesOfContract).toHaveBeenCalledWith(
      1,
      "desc",
    );

    expect(contractRepository.updateContract).toHaveBeenCalledWith(1, {
      amount: 600,
      endDate: new Date("2026-06-30"),
    });
  });

  it("should set amount to 0 and endDate to null when no milestones exist", async () => {
    vi.mocked(milestoneRepository.getMilestonesOfContract).mockResolvedValue(
      [],
    );

    vi.mocked(contractRepository.updateContract).mockResolvedValue({} as any);

    await contractServices.updateContractInfo("1", {} as any);

    expect(contractRepository.updateContract).toHaveBeenCalledWith(1, {
      amount: 0,
      endDate: null,
    });
  });

  it("should throw 'Error fetching milestones' when repository fails", async () => {
    vi.mocked(milestoneRepository.getMilestonesOfContract).mockRejectedValue(
      new Error("DB Error"),
    );

    await expect(
      contractServices.updateContractInfo("1", {} as any),
    ).rejects.toThrow("Error fetching milestones");
  });

  it("should throw 'Error updating contract' when contract update fails", async () => {
    vi.mocked(milestoneRepository.getMilestonesOfContract).mockResolvedValue([
      {
        amount: 100,
        deadline: new Date(),
      },
    ] as any);

    vi.mocked(contractRepository.updateContract).mockRejectedValue(
      new Error("DB Error"),
    );

    await expect(
      contractServices.updateContractInfo("1", {} as any),
    ).rejects.toThrow("Error updating contract");
  });
});
