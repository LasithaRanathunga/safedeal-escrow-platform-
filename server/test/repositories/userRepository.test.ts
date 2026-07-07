import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { createUser, getUserByEmail } from "../../repositories/userRepository";
import db from "../../db/db";

describe("userRepository", () => {
  const testUser = {
    email: "test@example.com",
    name: "Test User",
    password: "12345678",
  };

  beforeAll(async () => {
    await db.user.deleteMany();
    await db.refreshToken.deleteMany();
  });

  afterAll(async () => {
    await db.user.deleteMany();
    await db.refreshToken.deleteMany();
  });

  describe("createUser", () => {
    it("creates a new user successfully", async () => {
      const user = await createUser(
        testUser.email,
        testUser.name,
        testUser.password,
      );

      expect(user).toMatchObject(testUser);
    });

    it("throws an error when creating a user with an existing email", async () => {
      const testUser2 = {
        email: testUser.email,
        name: "Test User 2",
        password: "12345678",
      };

      await expect(
        createUser(testUser2.email, testUser2.name, testUser2.password),
      ).rejects.toThrow("Unique constraint failed");
    });
  });

  describe("getUserByEmail", () => {
    it("retrieves the user by email successfully", async () => {
      const user = await getUserByEmail(testUser.email);

      expect(user).toMatchObject(testUser);
    });
  });
});
