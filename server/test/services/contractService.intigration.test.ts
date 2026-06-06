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
