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
