import { describe, it, expect, vi, beforeEach } from "vitest";
import * as contractControllers from "../../controllers/contractControllers";
import * as contractRepo from "../../repositories/contractRepository";
import * as contractServices from "../../services/contractServices";

vi.mock("../../repositories/contractRepository");
vi.mock("../../services/contractServices");

describe("createContract controller", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      body: {
        title: "Test Contract",
        description: "Test Desc",
        role: "seller",
      },
      user: {
        id: 1,
      },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  it("should create contract and return 201", async () => {
    const mockContract = {
      id: 1,
      title: "Test Contract",
      description: "Test Desc",
      ownerId: 1,
      sellerId: 1,
      buyerId: null,
      status: "ACTIVE",
    };

    (contractRepo.createContract as any).mockResolvedValue(mockContract);

    await contractControllers.createContract(req, res);

    expect(contractRepo.createContract).toHaveBeenCalledWith({
      title: "Test Contract",
      description: "Test Desc",
      ownerId: 1,
      sellerId: 1,
      buyerId: null,
      endDate: null,
      amount: null,
      status: "ACTIVE",
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ contract: mockContract });
  });

  it("should return 500 if repository throws error", async () => {
    (contractRepo.createContract as any).mockRejectedValue(
      new Error("DB error"),
    );

    await contractControllers.createContract(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      message: "Error creating contract",
      error: expect.any(Error),
    });
  });
});

describe("createMilestone controller", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      body: {
        title: "Milestone 1",
        description: "Test milestone",
        amount: "1000",
        deadline: "2026-01-01",
        order: "1",
        contractId: "1",
      },
      user: { id: 1 },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  it("should create milestone and return 201", async () => {
    const mockMilestone = {
      id: 1,
      title: "Milestone 1",
      amount: 1000,
    };

    (contractServices.createMilestone as any).mockResolvedValue(mockMilestone);

    await contractControllers.createMilestone(req, res);

    expect(contractServices.createMilestone).toHaveBeenCalledWith(req.body);

    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith({
      milestone: mockMilestone,
    });
  });

  it("should return 500 when service throws error", async () => {
    (contractServices.createMilestone as any).mockRejectedValue(
      new Error("Service error"),
    );

    await contractControllers.createMilestone(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      message: "Error creating milestone",
      error: expect.any(Error),
    });
  });
});
