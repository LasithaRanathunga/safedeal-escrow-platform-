import { describe, it, expect, vi, beforeEach } from "vitest";
import * as milestoneRepository from "../../repositories/milestoneRepository";
import * as contractRepository from "../../repositories/contractRepository";
import * as userRepository from "../../repositories/userRepository";
import * as contractServices from "../../services/contractServices";
import db from "../../db/db";
import { registerConsoleShortcuts } from "vitest/node";

vi.mock("../../repositories/milestoneRepository");
vi.mock("../../repositories/contractRepository");
vi.mock("../../repositories/userRepository");

vi.mock("../../db/db", () => ({
  default: {
    $transaction: vi.fn(),
  },
}));

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

    await contractServices.updateContractInfo("1");

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

    await contractServices.updateContractInfo("1");

    expect(contractRepository.updateContract).toHaveBeenCalledWith(1, {
      amount: 0,
      endDate: null,
    });
  });

  it("should throw 'Error fetching milestones' when repository fails", async () => {
    vi.mocked(milestoneRepository.getMilestonesOfContract).mockRejectedValue(
      new Error("DB Error"),
    );

    await expect(contractServices.updateContractInfo("1")).rejects.toThrow(
      "Error fetching milestones",
    );
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

    await expect(contractServices.updateContractInfo("1")).rejects.toThrow(
      "Error updating contract",
    );
  });
});

describe("updateContractInfoTx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const txMock = {} as any;

  it("should calculate total amount and update contract with latest deadline", async () => {
    const mockMilestones = [
      { amount: 300, deadline: new Date("2026-03-01") },
      { amount: 200, deadline: new Date("2026-02-01") },
      { amount: 100, deadline: new Date("2026-01-01") },
    ];

    (milestoneRepository.getMilestonesOfContractTx as any).mockResolvedValue(
      mockMilestones,
    );

    (contractRepository.updateContractTx as any).mockResolvedValue({});

    await contractServices.updateContractInfoTx("1", txMock);

    expect(milestoneRepository.getMilestonesOfContractTx).toHaveBeenCalledWith(
      txMock,
      1,
      "desc",
    );

    expect(contractRepository.updateContractTx).toHaveBeenCalledWith(
      txMock,
      1,
      {
        amount: 600,
        endDate: new Date("2026-03-01"),
      },
    );
  });

  it("should handle empty milestones correctly", async () => {
    (milestoneRepository.getMilestonesOfContractTx as any).mockResolvedValue(
      [],
    );

    (contractRepository.updateContractTx as any).mockResolvedValue({});

    await contractServices.updateContractInfoTx("1", txMock);

    expect(contractRepository.updateContractTx).toHaveBeenCalledWith(
      txMock,
      1,
      {
        amount: 0,
        endDate: null,
      },
    );
  });

  it("should throw error when fetching milestones fails", async () => {
    (milestoneRepository.getMilestonesOfContractTx as any).mockRejectedValue(
      new Error("DB error"),
    );

    await expect(
      contractServices.updateContractInfoTx("1", txMock),
    ).rejects.toThrow("Error fetching milestones");
  });

  it("should throw error when updating contract fails", async () => {
    (milestoneRepository.getMilestonesOfContractTx as any).mockResolvedValue([
      { amount: 100, deadline: new Date() },
    ]);

    (contractRepository.updateContractTx as any).mockRejectedValue(
      new Error("DB error"),
    );

    await expect(
      contractServices.updateContractInfoTx("1", txMock),
    ).rejects.toThrow("Error updating contract");
  });
});

describe("createMilestone", () => {
  const txMock = {} as any;

  beforeEach(() => {
    vi.clearAllMocks();

    (db.$transaction as any).mockImplementation(async (cb: any) => {
      return cb(txMock);
    });
  });

  it("should shift milestone order, create milestone and update contract info", async () => {
    const createdMilestone = {
      id: 1,
      title: "UI Design",
    };

    vi.mocked(milestoneRepository.shiftMilestoneOrder).mockResolvedValue(
      {} as any,
    );

    vi.mocked(milestoneRepository.createMilestone).mockResolvedValue(
      createdMilestone as any,
    );

    vi.mocked(milestoneRepository.getMilestonesOfContractTx).mockResolvedValue([
      {
        amount: 300,
        deadline: new Date("2026-06-30"),
      },
      {
        amount: 200,
        deadline: new Date("2026-06-15"),
      },
    ] as any);

    vi.mocked(contractRepository.updateContractTx).mockResolvedValue({} as any);

    const result = await contractServices.createMilestone({
      title: "UI Design",
      description: "Homepage Design",
      amount: "500",
      deadline: "2026-06-01",
      order: "2",
      contractId: "10",
    });

    expect(milestoneRepository.shiftMilestoneOrder).toHaveBeenCalledWith(
      txMock,
      10,
      2,
    );

    expect(milestoneRepository.createMilestone).toHaveBeenCalledWith(txMock, {
      title: "UI Design",
      description: "Homepage Design",
      amount: 500,
      deadline: new Date("2026-06-01"),
      order: 2,
      contractId: 10,
    });

    expect(result).toEqual(createdMilestone);
  });

  it("should throw when shifting milestone order fails", async () => {
    vi.mocked(milestoneRepository.shiftMilestoneOrder).mockRejectedValue(
      new Error("DB Error"),
    );

    await expect(
      contractServices.createMilestone({
        title: "UI Design",
        description: "Homepage Design",
        amount: "500",
        deadline: "2026-06-01",
        order: "2",
        contractId: "10",
      }),
    ).rejects.toThrow("DB Error");
  });

  it("should throw when milestone creation fails", async () => {
    vi.mocked(milestoneRepository.shiftMilestoneOrder).mockResolvedValue(
      {} as any,
    );

    vi.mocked(milestoneRepository.createMilestone).mockRejectedValue(
      new Error("Create failed"),
    );

    await expect(
      contractServices.createMilestone({
        title: "UI Design",
        description: "Homepage Design",
        amount: "500",
        deadline: "2026-06-01",
        order: "2",
        contractId: "10",
      }),
    ).rejects.toThrow("Create failed");
  });

  it("should throw when updating contract info fails", async () => {
    vi.mocked(milestoneRepository.shiftMilestoneOrder).mockResolvedValue(
      {} as any,
    );

    vi.mocked(milestoneRepository.createMilestone).mockResolvedValue({
      id: 1,
    } as any);

    vi.mocked(milestoneRepository.getMilestonesOfContractTx).mockRejectedValue(
      new Error("DB Error"),
    );

    await expect(
      contractServices.createMilestone({
        title: "UI Design",
        description: "Homepage Design",
        amount: "500",
        deadline: "2026-06-01",
        order: "2",
        contractId: "10",
      }),
    ).rejects.toThrow("Error fetching milestones");
  });
});

describe("getContractDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return null when contract does not exist", async () => {
    vi.mocked(contractRepository.getContractById).mockResolvedValue(null);

    const result = await contractServices.getContractDetails(1, {
      id: "10",
      email: "user@test.com",
    });

    expect(result).toBeNull();
  });

  it("should return contract details with owner, active milestone and buyer role", async () => {
    vi.mocked(contractRepository.getContractById).mockResolvedValue({
      id: 1,
      ownerId: 100,
      buyerId: 10,
      sellerId: 20,
      milestones: [
        { order: 1, isPayed: true },
        { order: 2, isPayed: true },
        { order: 3, isPayed: false },
        { order: 4, isPayed: false },
      ],
    } as any);

    vi.mocked(userRepository.getUserById).mockResolvedValue({
      id: 100,
      email: "owner@test.com",
    } as any);

    const result = await contractServices.getContractDetails(1, {
      id: "10",
      email: "owner@test.com",
    });

    expect(result).toMatchObject({
      isOwner: true,
      activeMilestone: 3,
      role: "buyer",
    });
  });

  it("should return seller role when current user is seller", async () => {
    vi.mocked(contractRepository.getContractById).mockResolvedValue({
      id: 1,
      ownerId: 100,
      buyerId: 10,
      sellerId: 20,
      milestones: [{ order: 1, isPayed: true }],
    } as any);

    vi.mocked(userRepository.getUserById).mockResolvedValue({
      id: 100,
      email: "owner@test.com",
    } as any);

    const result = await contractServices.getContractDetails(1, {
      id: "20",
      email: "someone@test.com",
    });

    expect(result?.role).toBe("seller");
  });

  it("should return undefined role when user is neither buyer nor seller", async () => {
    vi.mocked(contractRepository.getContractById).mockResolvedValue({
      id: 1,
      ownerId: 100,
      buyerId: 10,
      sellerId: 20,
      milestones: [{ order: 1, isPayed: true }],
    } as any);

    vi.mocked(userRepository.getUserById).mockResolvedValue({
      id: 100,
      email: "owner@test.com",
    } as any);

    const result = await contractServices.getContractDetails(1, {
      id: "999",
      email: "other@test.com",
    });

    expect(result?.role).toBeUndefined();
  });

  it("should return activeMilestone as 0 when no milestone is paid", async () => {
    vi.mocked(contractRepository.getContractById).mockResolvedValue({
      id: 1,
      ownerId: 100,
      buyerId: 10,
      sellerId: 20,
      milestones: [
        { order: 1, isPayed: false },
        { order: 2, isPayed: false },
      ],
    } as any);

    vi.mocked(userRepository.getUserById).mockResolvedValue({
      id: 100,
      email: "owner@test.com",
    } as any);

    const result = await contractServices.getContractDetails(1, {
      id: "10",
      email: "other@test.com",
    });

    expect(result?.activeMilestone).toBe(1);
    expect(result?.isOwner).toBe(false);
  });
});
