import { describe, it, expect, beforeEach, afterAll } from "vitest";
import db from "../../db/db";
import * as contractServices from "../../services/contractServices";

describe("updateContractInfo Integration", () => {
  beforeEach(async () => {
    await db.milestone.deleteMany();
    await db.contract.deleteMany();
    await db.user.deleteMany();
  });

  afterAll(async () => {
    await db.milestone.deleteMany();
    await db.contract.deleteMany();
    await db.user.deleteMany();
  });

  it("should update contract amount and endDate from milestones", async () => {
    const owner = await db.user.create({
      data: {
        email: "owner@test.com",
        password: "password",
        name: "Owner",
      },
    });

    const contract = await db.contract.create({
      data: {
        title: "Website Project",
        description: "Build a website",
        ownerId: owner.id,
      },
    });

    await db.milestone.createMany({
      data: [
        {
          title: "Milestone 1",
          description: "Design",
          amount: 100,
          order: 1,
          deadline: new Date("2026-01-01"),
          contractId: contract.id,
        },
        {
          title: "Milestone 2",
          description: "Frontend",
          amount: 200,
          order: 2,
          deadline: new Date("2026-02-01"),
          contractId: contract.id,
        },
        {
          title: "Milestone 3",
          description: "Backend",
          amount: 300,
          order: 3,
          deadline: new Date("2026-03-01"),
          contractId: contract.id,
        },
      ],
    });

    await contractServices.updateContractInfo(contract.id.toString());

    const updatedContract = await db.contract.findUnique({
      where: {
        id: contract.id,
      },
    });

    expect(updatedContract).not.toBeNull();

    expect(updatedContract?.amount).toBe(600);

    expect(updatedContract?.endDate).toEqual(new Date("2026-03-01"));
  });

  it("should set amount to 0 and endDate to null when contract has no milestones", async () => {
    const owner = await db.user.create({
      data: {
        email: "owner@test.com",
        password: "password",
        name: "Owner",
      },
    });

    const contract = await db.contract.create({
      data: {
        title: "Website Project",
        description: "Build a website",
        ownerId: owner.id,
      },
    });

    await contractServices.updateContractInfo(contract.id.toString());

    const updatedContract = await db.contract.findUnique({
      where: {
        id: contract.id,
      },
    });

    expect(updatedContract?.amount).toBe(0);
    expect(updatedContract?.endDate).toBeNull();
  });
});

describe("updateContractInfoTx Integration", () => {
  beforeEach(async () => {
    await db.milestone.deleteMany();
    await db.contract.deleteMany();
    await db.user.deleteMany();
  });

  it("should update contract amount and endDate inside transaction", async () => {
    const user = await db.user.create({
      data: {
        email: "owner@test.com",
        password: "password",
        name: "Owner",
      },
    });

    const contract = await db.contract.create({
      data: {
        title: "Test Contract",
        description: "Test description",
        ownerId: user.id,
      },
    });

    const latestDate = new Date("2026-01-01");
    const olderDate = new Date("2025-12-01");

    await db.milestone.createMany({
      data: [
        {
          title: "Milestone 1",
          description: "desc",
          amount: 1000,
          deadline: latestDate,
          order: 2,
          contractId: contract.id,
        },
        {
          title: "Milestone 2",
          description: "desc",
          amount: 500,
          deadline: olderDate,
          order: 1,
          contractId: contract.id,
        },
      ],
    });

    await db.$transaction(async (tx) => {
      await contractServices.updateContractInfoTx(contract.id.toString(), tx);
    });

    const updatedContract = await db.contract.findUnique({
      where: { id: contract.id },
    });

    expect(updatedContract?.amount).toBe(1500);
    expect(updatedContract?.endDate?.toISOString()).toBe(
      latestDate.toISOString(),
    );
  });

  it("should set amount to 0 and endDate to null when no milestones exist", async () => {
    const user = await db.user.create({
      data: {
        email: "owner@test.com",
        password: "password",
        name: "Owner",
      },
    });

    const contract = await db.contract.create({
      data: {
        title: "Test Contract",
        ownerId: user.id,
        description: "Test description",
        amount: 999,
        endDate: new Date(),
      },
    });

    await db.$transaction(async (tx) => {
      await contractServices.updateContractInfoTx(contract.id.toString(), tx);
    });

    const updatedContract = await db.contract.findUnique({
      where: { id: contract.id },
    });

    expect(updatedContract?.amount).toBe(0);
    expect(updatedContract?.endDate).toBeNull();
  });

  it("should rollback when transaction fails", async () => {
    const user = await db.user.create({
      data: {
        email: "owner@test.com",
        password: "password",
        name: "Owner",
      },
    });

    const contract = await db.contract.create({
      data: {
        title: "Test Contract",
        ownerId: user.id,
        amount: 0,
        description: "Test description",
      },
    });

    await db.milestone.create({
      data: {
        title: "Milestone",
        description: "desc",
        amount: 1000,
        deadline: new Date("2026-01-01"),
        order: 1,
        contractId: contract.id,
      },
    });

    await expect(
      db.$transaction(async (tx) => {
        await contractServices.updateContractInfoTx(contract.id.toString(), tx);

        throw new Error("Force rollback");
      }),
    ).rejects.toThrow("Force rollback");

    const updatedContract = await db.contract.findUnique({
      where: {
        id: contract.id,
      },
    });

    expect(updatedContract?.amount).toBe(0);
  });
});

describe("createMilestone Integration", () => {
  beforeEach(async () => {
    await db.milestone.deleteMany();
    await db.contract.deleteMany();
    await db.user.deleteMany();
  });

  it("should create milestone and update contract totals", async () => {
    const user = await db.user.create({
      data: {
        email: "test@test.com",
        password: "password",
        name: "Test User",
      },
    });

    const contract = await db.contract.create({
      data: {
        title: "Test Contract",
        description: "Test Description",
        ownerId: user.id,
      },
    });

    const deadline = new Date("2026-12-31");

    const milestone = await contractServices.createMilestone({
      title: "Milestone 1",
      description: "Description",
      amount: "1000",
      deadline: deadline.toISOString(),
      order: "1",
      contractId: contract.id.toString(),
    });

    expect(milestone.title).toBe("Milestone 1");
    expect(milestone.order).toBe(1);

    const updatedContract = await db.contract.findUnique({
      where: { id: contract.id },
    });

    expect(updatedContract?.amount).toBe(1000);
    expect(updatedContract?.endDate?.getTime()).toBe(deadline.getTime());
  });
});

describe("getContractDetails Integration", () => {
  beforeEach(async () => {
    await db.milestone.deleteMany();
    await db.contract.deleteMany();
    await db.refreshToken.deleteMany();
    await db.user.deleteMany();
  });

  it("should return null when contract does not exist", async () => {
    const result = await contractServices.getContractDetails(99999, {
      id: "1",
      email: "test@test.com",
    });

    expect(result).toBeNull();
  });

  it("should return contract details with buyer role and owner status", async () => {
    const owner = await db.user.create({
      data: {
        email: "owner@test.com",
        password: "password",
        name: "Owner",
      },
    });

    const buyer = await db.user.create({
      data: {
        email: "buyer@test.com",
        password: "password",
        name: "Buyer",
      },
    });

    const contract = await db.contract.create({
      data: {
        title: "Test Contract",
        description: "Test Description",
        ownerId: owner.id,
        buyerId: buyer.id,
      },
    });

    await db.milestone.createMany({
      data: [
        {
          title: "Milestone 1",
          description: "First milestone",
          amount: 100,
          order: 1,
          isPayed: true,
          deadline: new Date("2026-01-01"),
          contractId: contract.id,
        },
        {
          title: "Milestone 2",
          description: "Second milestone",
          amount: 200,
          order: 2,
          isPayed: false,
          deadline: new Date("2026-02-01"),
          contractId: contract.id,
        },
      ],
    });

    const result = await contractServices.getContractDetails(contract.id, {
      id: buyer.id.toString(),
      email: owner.email,
    });

    expect(result).not.toBeNull();
    expect(result?.id).toBe(contract.id);
    expect(result?.isOwner).toBe(true);
    expect(result?.role).toBe("buyer");
    expect(result?.activeMilestone).toBe(2);
  });

  it("should return seller role", async () => {
    const owner = await db.user.create({
      data: {
        email: "owner@test.com",
        password: "password",
        name: "Owner",
      },
    });

    const seller = await db.user.create({
      data: {
        email: "seller@test.com",
        password: "password",
        name: "Seller",
      },
    });

    const contract = await db.contract.create({
      data: {
        title: "Test Contract",
        description: "Test Description",
        ownerId: owner.id,
        sellerId: seller.id,
      },
    });

    const result = await contractServices.getContractDetails(contract.id, {
      id: seller.id.toString(),
      email: seller.email,
    });

    expect(result).not.toBeNull();
    expect(result?.role).toBe("seller");
    expect(result?.isOwner).toBe(false);
  });

  it("should return undefined role when user is neither buyer nor seller", async () => {
    const owner = await db.user.create({
      data: {
        email: "owner@test.com",
        password: "password",
        name: "Owner",
      },
    });

    const stranger = await db.user.create({
      data: {
        email: "stranger@test.com",
        password: "password",
        name: "Stranger",
      },
    });

    const contract = await db.contract.create({
      data: {
        title: "Test Contract",
        description: "Test Description",
        ownerId: owner.id,
      },
    });

    const result = await contractServices.getContractDetails(contract.id, {
      id: stranger.id.toString(),
      email: stranger.email,
    });

    expect(result).not.toBeNull();
    expect(result?.role).toBeUndefined();
    expect(result?.isOwner).toBe(false);
  });

  it("should calculate active milestone correctly when multiple milestones are paid", async () => {
    const owner = await db.user.create({
      data: {
        email: "owner@test.com",
        password: "password",
        name: "Owner",
      },
    });

    const contract = await db.contract.create({
      data: {
        title: "Test Contract",
        description: "Test Description",
        ownerId: owner.id,
      },
    });

    await db.milestone.createMany({
      data: [
        {
          title: "Milestone 1",
          description: "M1",
          amount: 100,
          order: 1,
          isPayed: true,
          deadline: new Date(),
          contractId: contract.id,
        },
        {
          title: "Milestone 2",
          description: "M2",
          amount: 100,
          order: 2,
          isPayed: true,
          deadline: new Date(),
          contractId: contract.id,
        },
        {
          title: "Milestone 3",
          description: "M3",
          amount: 100,
          order: 3,
          isPayed: false,
          deadline: new Date(),
          contractId: contract.id,
        },
      ],
    });

    const result = await contractServices.getContractDetails(contract.id, {
      id: owner.id.toString(),
      email: owner.email,
    });

    expect(result).not.toBeNull();
    expect(result?.activeMilestone).toBe(3);
  });
});

describe("invitePartner Integration", () => {
  beforeEach(async () => {
    await db.milestone.deleteMany();
    await db.contract.deleteMany();
    await db.refreshToken.deleteMany();
    await db.user.deleteMany();
  });

  it("should throw when partner does not exist", async () => {
    const owner = await db.user.create({
      data: {
        email: "owner@test.com",
        password: "password",
        name: "Owner",
      },
    });

    const contract = await db.contract.create({
      data: {
        title: "Contract",
        description: "Description",
        ownerId: owner.id,
      },
    });

    await expect(
      contractServices.invitePartner(contract.id, "missing@test.com"),
    ).rejects.toThrow("Partner not found");
  });

  it("should throw when contract does not exist", async () => {
    await db.user.create({
      data: {
        email: "partner@test.com",
        password: "password",
        name: "Partner",
      },
    });

    await expect(
      contractServices.invitePartner(99999, "partner@test.com"),
    ).rejects.toThrow("Contract not found");
  });

  it("should throw when owner is invited as partner", async () => {
    const owner = await db.user.create({
      data: {
        email: "owner@test.com",
        password: "password",
        name: "Owner",
      },
    });

    const contract = await db.contract.create({
      data: {
        title: "Contract",
        description: "Description",
        ownerId: owner.id,
      },
    });

    await expect(
      contractServices.invitePartner(contract.id, owner.email),
    ).rejects.toThrow("Owner cannot be invited as a partner");
  });

  it("should assign seller when seller slot is empty", async () => {
    const owner = await db.user.create({
      data: {
        email: "owner@test.com",
        password: "password",
        name: "Owner",
      },
    });

    const partner = await db.user.create({
      data: {
        email: "seller@test.com",
        password: "password",
        name: "Seller",
      },
    });

    const contract = await db.contract.create({
      data: {
        title: "Contract",
        description: "Description",
        ownerId: owner.id,
      },
    });

    await contractServices.invitePartner(contract.id, partner.email);

    const updatedContract = await db.contract.findUnique({
      where: {
        id: contract.id,
      },
    });

    expect(updatedContract?.sellerId).toBe(partner.id);
    expect(updatedContract?.buyerId).toBeNull();
  });

  it("should assign buyer when seller already exists", async () => {
    const owner = await db.user.create({
      data: {
        email: "owner@test.com",
        password: "password",
        name: "Owner",
      },
    });

    const seller = await db.user.create({
      data: {
        email: "seller@test.com",
        password: "password",
        name: "Seller",
      },
    });

    const buyer = await db.user.create({
      data: {
        email: "buyer@test.com",
        password: "password",
        name: "Buyer",
      },
    });

    const contract = await db.contract.create({
      data: {
        title: "Contract",
        description: "Description",
        ownerId: owner.id,
        sellerId: seller.id,
      },
    });

    await contractServices.invitePartner(contract.id, buyer.email);

    const updatedContract = await db.contract.findUnique({
      where: {
        id: contract.id,
      },
    });

    expect(updatedContract?.sellerId).toBe(seller.id);
    expect(updatedContract?.buyerId).toBe(buyer.id);
  });

  it("should throw when buyer and seller are already assigned", async () => {
    const owner = await db.user.create({
      data: {
        email: "owner@test.com",
        password: "password",
        name: "Owner",
      },
    });

    const seller = await db.user.create({
      data: {
        email: "seller@test.com",
        password: "password",
        name: "Seller",
      },
    });

    const buyer = await db.user.create({
      data: {
        email: "buyer@test.com",
        password: "password",
        name: "Buyer",
      },
    });

    const extraUser = await db.user.create({
      data: {
        email: "extra@test.com",
        password: "password",
        name: "Extra",
      },
    });

    const contract = await db.contract.create({
      data: {
        title: "Contract",
        description: "Description",
        ownerId: owner.id,
        sellerId: seller.id,
        buyerId: buyer.id,
      },
    });

    await expect(
      contractServices.invitePartner(contract.id, extraUser.email),
    ).rejects.toThrow(
      "Both buyer and seller are already assigned for this contract",
    );
  });
});
