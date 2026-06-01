import { beforeEach, afterAll, describe, expect, it } from "vitest";
import db from "../../db/db";
import * as contractRepository from "../../repositories/contractRepository";

afterAll(async () => {
  await db.refreshToken.deleteMany();
  await db.milestone.deleteMany();
  await db.contract.deleteMany(); // (if contracts exist in DB)
  await db.user.deleteMany();
});

describe("contractRepository.createContract", () => {
  beforeEach(async () => {
    // clean DB in correct order (important because of FK constraints)
    await db.contract.deleteMany();
    await db.user.deleteMany();
  });

  it("should create a contract and return it", async () => {
    // 1. create required related user (ownerId FK dependency)
    const owner = await db.user.create({
      data: {
        name: "Test User",
        email: "test@test.com",
        password: "hashed-password",
      },
    });

    // 2. call repository function
    const result = await contractRepository.createContract({
      title: "New Website",
      description: "Build a website for client",
      ownerId: owner.id,
      sellerId: null,
      buyerId: null,
      endDate: null,
      amount: null,
      status: "ACTIVE",
    });

    // 3. check returned value
    expect(result).toMatchObject({
      title: "New Website",
      description: "Build a website for client",
      ownerId: owner.id,
      sellerId: null,
      buyerId: null,
      status: "ACTIVE",
    });

    // 4. verify it is actually in database
    const dbContract = await db.contract.findUnique({
      where: { id: result.id },
    });

    expect(dbContract).not.toBeNull();
    expect(dbContract?.ownerId).toBe(owner.id);
    expect(dbContract?.title).toBe("New Website");
  });
});

describe("contractRepository.getContractById", () => {
  beforeEach(async () => {
    await db.contract.deleteMany();
    await db.user.deleteMany();
    await db.milestone.deleteMany();
  });

  it("should return contract by id with relations", async () => {
    // 1. create required user (FK dependency)
    const owner = await db.user.create({
      data: {
        name: "Owner",
        email: "owner@test.com",
        password: "hashed-password",
      },
    });

    const buyer = await db.user.create({
      data: {
        name: "Buyer",
        email: "buyer@test.com",
        password: "hashed-password",
      },
    });

    const seller = await db.user.create({
      data: {
        name: "Seller",
        email: "seller@test.com",
        password: "hashed-password",
      },
    });

    // 2. create contract using repository
    const contract = await contractRepository.createContract({
      title: "Website Project",
      description: "Build SaaS app",
      ownerId: owner.id,
      buyerId: buyer.id,
      sellerId: seller.id,
      endDate: null,
      amount: null,
      status: "ACTIVE",
    });

    // 3. fetch using function under test
    const result = await contractRepository.getContractById(contract.id);

    // 4. assertions
    expect(result).not.toBeNull();

    expect(result?.id).toBe(contract.id);

    expect(result?.buyer).toEqual({
      name: "Buyer",
    });

    expect(result?.seller).toEqual({
      name: "Seller",
    });

    expect(Array.isArray(result?.milestones)).toBe(true);
    expect(result?.milestones.length).toBe(0);

    expect(result?.title).toBe("Website Project");
  });
});

describe("contractRepository.getAllContractsOfUser", () => {
  beforeEach(async () => {
    await db.contract.deleteMany();
    await db.user.deleteMany();
    await db.milestone.deleteMany();
  });

  it("should return only contracts where user is buyer or seller", async () => {
    // 1. create users
    const userA = await db.user.create({
      data: {
        name: "User A",
        email: "a@test.com",
        password: "hashed",
      },
    });

    const userB = await db.user.create({
      data: {
        name: "User B",
        email: "b@test.com",
        password: "hashed",
      },
    });

    const userC = await db.user.create({
      data: {
        name: "User C",
        email: "c@test.com",
        password: "hashed",
      },
    });

    // 2. create contracts

    // userA is buyer
    const contract1 = await contractRepository.createContract({
      title: "Contract 1",
      description: "A is buyer",
      ownerId: userA.id,
      buyerId: userA.id,
      sellerId: userB.id,
      endDate: null,
      amount: null,
      status: "ACTIVE",
    });

    // userA is seller
    const contract2 = await contractRepository.createContract({
      title: "Contract 2",
      description: "A is seller",
      ownerId: userB.id,
      buyerId: userC.id,
      sellerId: userA.id,
      endDate: null,
      amount: null,
      status: "ACTIVE",
    });

    // userC unrelated contract
    await contractRepository.createContract({
      title: "Contract 3",
      description: "no relation",
      ownerId: userB.id,
      buyerId: userB.id,
      sellerId: userC.id,
      endDate: null,
      amount: null,
      status: "ACTIVE",
    });

    // 3. fetch contracts for userA
    const result = await contractRepository.getAllContractsOfUser(userA.id);

    // 4. assertions
    expect(result.length).toBe(2);

    const titles = result.map((c) => c.title);

    expect(titles).toContain("Contract 1");
    expect(titles).toContain("Contract 2");
    expect(titles).not.toContain("Contract 3");

    // 5. check relations exist
    expect(result[0].buyer).toHaveProperty("name");
    expect(result[0].seller).toHaveProperty("name");
  });
});

describe("contractRepository.updatePartner", () => {
  beforeEach(async () => {
    await db.contract.deleteMany();
    await db.user.deleteMany();
  });

  it("should update sellerId of a contract", async () => {
    // 1. create users
    const owner = await db.user.create({
      data: {
        name: "Owner",
        email: "owner@test.com",
        password: "hashed",
      },
    });

    const seller = await db.user.create({
      data: {
        name: "Seller",
        email: "seller@test.com",
        password: "hashed",
      },
    });

    // 2. create contract
    const contract = await contractRepository.createContract({
      title: "Contract",
      description: "Test contract",
      ownerId: owner.id,
      buyerId: null,
      sellerId: null,
      endDate: null,
      amount: null,
      status: "ACTIVE",
    });

    // 3. update sellerId
    await contractRepository.updatePartner(contract.id, {
      sellerId: seller.id,
    });

    // 4. verify DB update
    const updated = await db.contract.findUnique({
      where: { id: contract.id },
    });

    expect(updated?.sellerId).toBe(seller.id);
  });

  it("should update buyerId of a contract", async () => {
    const owner = await db.user.create({
      data: {
        name: "Owner",
        email: "owner@test.com",
        password: "hashed",
      },
    });

    const buyer = await db.user.create({
      data: {
        name: "Buyer",
        email: "buyer@test.com",
        password: "hashed",
      },
    });

    const contract = await contractRepository.createContract({
      title: "Contract",
      description: "Test contract",
      ownerId: owner.id,
      buyerId: null,
      sellerId: null,
      endDate: null,
      amount: null,
      status: "ACTIVE",
    });

    await contractRepository.updatePartner(contract.id, {
      buyerId: buyer.id,
    });

    const updated = await db.contract.findUnique({
      where: { id: contract.id },
    });

    expect(updated?.buyerId).toBe(buyer.id);
  });
});

describe("contractRepository.updateContract", () => {
  beforeEach(async () => {
    await db.contract.deleteMany();
    await db.user.deleteMany();
  });

  it("should update contract title, description and status", async () => {
    // 1. create owner user
    const owner = await db.user.create({
      data: {
        name: "Owner",
        email: "owner@test.com",
        password: "hashed",
      },
    });

    // 2. create contract
    const contract = await contractRepository.createContract({
      title: "Old Title",
      description: "Old Description",
      ownerId: owner.id,
      sellerId: null,
      buyerId: null,
      endDate: null,
      amount: null,
      status: "ACTIVE",
    });

    // 3. update contract
    const updated = await contractRepository.updateContract(contract.id, {
      title: "New Title",
      description: "New Description",
      status: "COMPLETED",
    });

    // 4. assertions (return value)
    expect(updated.title).toBe("New Title");
    expect(updated.description).toBe("New Description");
    expect(updated.status).toBe("COMPLETED");

    // 5. verify DB persistence
    const dbContract = await db.contract.findUnique({
      where: { id: contract.id },
    });

    expect(dbContract?.title).toBe("New Title");
    expect(dbContract?.description).toBe("New Description");
    expect(dbContract?.status).toBe("COMPLETED");
  });

  it("should update amount and endDate", async () => {
    const owner = await db.user.create({
      data: {
        name: "Owner",
        email: "owner2@test.com",
        password: "hashed",
      },
    });

    const contract = await contractRepository.createContract({
      title: "Contract",
      description: "Test",
      ownerId: owner.id,
      sellerId: null,
      buyerId: null,
      endDate: null,
      amount: null,
      status: "ACTIVE",
    });

    const endDate = new Date();

    await contractRepository.updateContract(contract.id, {
      amount: 5000,
      endDate,
    });

    const dbContract = await db.contract.findUnique({
      where: { id: contract.id },
    });

    expect(dbContract?.amount).toBe(5000);
    expect(dbContract?.endDate?.getTime()).toBe(endDate.getTime());
  });
});
