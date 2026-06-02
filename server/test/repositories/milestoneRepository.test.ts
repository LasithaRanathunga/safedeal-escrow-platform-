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

describe("updateMilestone", () => {
  beforeEach(async () => {
    await db.milestone.deleteMany();
    await db.contract.deleteMany();
    await db.user.deleteMany();
  });

  it("should update the milestone and return milestoneId", async () => {
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

    await db.milestone.create({
      data: {
        title: "Initial Design",
        description: "Design homepage",
        amount: 500,
        deadline: new Date("2026-06-10"),
        order: 1,
        contractId: contract.id,
      },
    });

    const result = await milestoneRepository.updateMilestone(contract.id, 1, {
      title: "Updated Design",
      amount: 750,
    });

    expect(result).toBe(1);

    const updatedMilestone = await db.milestone.findUnique({
      where: {
        contractId_order: {
          contractId: contract.id,
          order: 1,
        },
      },
    });

    expect(updatedMilestone).toMatchObject({
      title: "Updated Design",
      amount: 750,
      description: "Design homepage",
      order: 1,
      contractId: contract.id,
    });
  });

  it("should throw when milestone does not exist", async () => {
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

    await expect(
      milestoneRepository.updateMilestone(contract.id, 99, {
        title: "Updated",
      }),
    ).rejects.toThrow();
  });
});

describe("getMilestonesOfContract", () => {
  beforeEach(async () => {
    await db.milestone.deleteMany();
    await db.contract.deleteMany();
    await db.user.deleteMany();
  });

  it("should return all milestones of a contract in ascending order by default", async () => {
    const user = await db.user.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        password: "password",
      },
    });

    const contract = await db.contract.create({
      data: {
        title: "Test Contract",
        description: "Test Description",
        ownerId: user.id,
        status: "ACTIVE",
      },
    });

    await db.milestone.createMany({
      data: [
        {
          title: "Milestone 3",
          description: "Desc",
          amount: 300,
          deadline: new Date(),
          order: 3,
          contractId: contract.id,
        },
        {
          title: "Milestone 1",
          description: "Desc",
          amount: 100,
          deadline: new Date(),
          order: 1,
          contractId: contract.id,
        },
        {
          title: "Milestone 2",
          description: "Desc",
          amount: 200,
          deadline: new Date(),
          order: 2,
          contractId: contract.id,
        },
      ],
    });

    const milestones = await milestoneRepository.getMilestonesOfContract(
      contract.id,
    );

    expect(milestones).toHaveLength(3);
    expect(milestones.map((m) => m.order)).toEqual([1, 2, 3]);
  });

  it("should return milestones in descending order when desc is specified", async () => {
    const user = await db.user.create({
      data: {
        name: "Test User 2",
        email: "test2@example.com",
        password: "password",
      },
    });

    const contract = await db.contract.create({
      data: {
        title: "Test Contract 2",
        description: "Test Description",
        ownerId: user.id,
        status: "ACTIVE",
      },
    });

    await db.milestone.createMany({
      data: [
        {
          title: "Milestone 1",
          description: "Desc",
          amount: 100,
          deadline: new Date(),
          order: 1,
          contractId: contract.id,
        },
        {
          title: "Milestone 2",
          description: "Desc",
          amount: 200,
          deadline: new Date(),
          order: 2,
          contractId: contract.id,
        },
        {
          title: "Milestone 3",
          description: "Desc",
          amount: 300,
          deadline: new Date(),
          order: 3,
          contractId: contract.id,
        },
      ],
    });

    const milestones = await milestoneRepository.getMilestonesOfContract(
      contract.id,
      "desc",
    );

    expect(milestones).toHaveLength(3);
    expect(milestones.map((m) => m.order)).toEqual([3, 2, 1]);
  });

  it("should return only milestones belonging to the specified contract", async () => {
    const user = await db.user.create({
      data: {
        name: "Test User 3",
        email: "test3@example.com",
        password: "password",
      },
    });

    const contract1 = await db.contract.create({
      data: {
        title: "Contract 1",
        description: "Description",
        ownerId: user.id,
        status: "ACTIVE",
      },
    });

    const contract2 = await db.contract.create({
      data: {
        title: "Contract 2",
        description: "Description",
        ownerId: user.id,
        status: "ACTIVE",
      },
    });

    await db.milestone.create({
      data: {
        title: "Contract 1 Milestone",
        description: "Desc",
        amount: 100,
        deadline: new Date(),
        order: 1,
        contractId: contract1.id,
      },
    });

    await db.milestone.create({
      data: {
        title: "Contract 2 Milestone",
        description: "Desc",
        amount: 200,
        deadline: new Date(),
        order: 1,
        contractId: contract2.id,
      },
    });

    const milestones = await milestoneRepository.getMilestonesOfContract(
      contract1.id,
    );

    expect(milestones).toHaveLength(1);
    expect(milestones[0].contractId).toBe(contract1.id);
    expect(milestones[0].title).toBe("Contract 1 Milestone");
  });
});
