import { describe, it, expect, beforeAll } from "vitest";
import * as authService from "../../services/authServices";
import db from "../../db/db";
import becrypt from "bcrypt";

describe("create user Intigration test", () => {
  const testUser = {
    email: "user@test.com",
    name: "Test User",
    password: "plainPassword",
  };

  beforeAll(async () => {
    await db.user.deleteMany();
  });

  it("sucessfully create the user in the database with a hashed password", async () => {
    const createdUser = await authService.createUser(
      testUser.email,
      testUser.name,
      testUser.password,
    );

    expect(createdUser.name).toBe(testUser.name);

    const doPasswordsMatch = await becrypt.compare(
      testUser.password,
      createdUser.password,
    );

    expect(doPasswordsMatch).toBe(true);
  });

  it("throw an error if there is a user with the same email", async () => {
    await expect(
      authService.createUser(testUser.email, testUser.name, testUser.password),
    ).rejects.toThrow("Unique constraint failed");
  });
});
