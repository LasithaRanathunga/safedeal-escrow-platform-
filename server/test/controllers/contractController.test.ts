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

describe("getContract controller", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      params: {
        contractId: "1",
      },
      user: {
        id: "1",
        email: "test@test.com",
      },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  it("should return contract with 200 status", async () => {
    const mockContract = {
      id: 1,
      title: "Test Contract",
    };

    (contractServices.getContractDetails as any).mockResolvedValue(
      mockContract,
    );

    await contractControllers.getContract(req, res);

    expect(contractServices.getContractDetails).toHaveBeenCalledWith(
      1,
      req.user,
    );

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      contract: mockContract,
    });
  });

  it("should return 404 when contract is not found", async () => {
    (contractServices.getContractDetails as any).mockResolvedValue(null);

    await contractControllers.getContract(req, res);

    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      code: "NO_CONTRACT_FOUND",
      message: "Contract not found",
    });
  });

  it("should return 500 when service throws error", async () => {
    (contractServices.getContractDetails as any).mockRejectedValue(
      new Error("DB error"),
    );

    await contractControllers.getContract(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      message: "Error fetching contract",
      error: expect.any(Error),
    });
  });
});

describe("getAllContracts controller", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      user: {
        id: "1",
      },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should return contracts with 200 status", async () => {
    const mockContracts = [
      { id: 1, title: "Contract 1" },
      { id: 2, title: "Contract 2" },
    ];

    (contractServices.getUserContracts as any).mockResolvedValue(mockContracts);

    await contractControllers.getAllContracts(req, res);

    expect(contractServices.getUserContracts).toHaveBeenCalledWith("1");

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      contracts: mockContracts,
    });
  });

  it("should return 500 when service throws error", async () => {
    (contractServices.getUserContracts as any).mockRejectedValue(
      new Error("DB error"),
    );

    await contractControllers.getAllContracts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      message: "Error fetching contracts",
    });
  });
});

describe("invitePartner controller", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      body: {
        contractId: "1",
        partnerEmail: "test@test.com",
      },
      user: {
        id: "1",
      },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  it("should invite partner successfully", async () => {
    (contractServices.invitePartner as any).mockResolvedValue(undefined);

    await contractControllers.invitePartner(req, res);

    expect(contractServices.invitePartner).toHaveBeenCalledWith(
      1,
      "test@test.com",
    );

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      message: "Partner invited successfully",
    });
  });

  it("should return 500 when service throws normal error", async () => {
    (contractServices.invitePartner as any).mockRejectedValue(
      new Error("Partner not found"),
    );

    await contractControllers.invitePartner(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      message: "Partner not found",
    });
  });

  it("should return custom statusCode when service throws custom error", async () => {
    (contractServices.invitePartner as any).mockRejectedValue({
      statusCode: 404,
      message: "Contract not found",
    });

    await contractControllers.invitePartner(req, res);

    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith({
      message: "Contract not found",
    });
  });
});
