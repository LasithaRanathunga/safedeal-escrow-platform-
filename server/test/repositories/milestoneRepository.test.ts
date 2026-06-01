import db from "../../db/db";
import * as milestoneRepository from "../../repositories/milestoneRepository";
import { beforeEach, afterAll, describe, expect, it } from "vitest";

afterAll(async () => {
  await db.milestone.deleteMany();
  await db.contract.deleteMany();
  await db.user.deleteMany();

  await db.$disconnect();
});

describe("getMilestone", () => {
  beforeEach(async () => {
    await db.milestone.deleteMany();
    await db.contract.deleteMany();
    await db.user.deleteMany();
  });

  it("should return the milestone for the given contractId and order", async () => {
    const user = await db.user.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        password: "password",
      },
    });

    const contract = await db.contract.create({
      data: {
        title: "Website Project",
        description: "Build landing page",
        ownerId: user.id,
        status: "ACTIVE",
      },
    });

    const milestone = await db.milestone.create({
      data: {
        title: "UI Design",
        description: "Design homepage",
        amount: 500,
        deadline: new Date("2026-06-10"),
        order: 1,
        contractId: contract.id,
      },
    });

    const result = await milestoneRepository.getMilestone(contract.id, 1);

    expect(result).not.toBeNull();

    expect(result).toMatchObject({
      id: milestone.id,
      title: "UI Design",
      description: "Design homepage",
      amount: 500,
      order: 1,
      contractId: contract.id,
    });
  });

  it("should return null when milestone does not exist", async () => {
    const user = await db.user.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        password: "password",
      },
    });

    const contract = await db.contract.create({
      data: {
        title: "Website Project",
        description: "Build landing page",
        ownerId: user.id,
        status: "ACTIVE",
      },
    });

    const result = await milestoneRepository.getMilestone(contract.id, 99);

    expect(result).toBeNull();
  });
});
