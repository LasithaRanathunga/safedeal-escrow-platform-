import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as authService from "../../services/authServices";
import * as refreshTokenRepo from "../../repositories/refreshTokenRepository";
import * as userRepo from "../../repositories/userRepository";
import db from "../../db/db";
import becrypt from "bcrypt";
import jwt from "jsonwebtoken";

describe("createUser Intigration test", () => {
  const testUser = {
    email: "user@test.com",
    name: "Test User",
    password: "plainPassword",
  };

  beforeAll(async () => {
    await db.user.deleteMany();
  });

  afterAll(async () => {
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

describe("ifTokenExist", () => {
  beforeAll(async () => {
    await db.refreshToken.deleteMany();
    await db.user.deleteMany();
  });

  it("Returns true if Token Exist", async () => {
    const testUser = await userRepo.createUser(
      "test@user.com",
      "test_user",
      "test_pass",
    );

    const testToken = await refreshTokenRepo.createRefreshToken(
      "test_token",
      testUser.id,
      new Date(),
    );

    const doesTokenExist = await authService.ifRefrechTokenExists("test_token");

    expect(doesTokenExist).toBe(true);
  });
});

describe("createRefreshToken", () => {
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

  beforeAll(async () => {
    await db.refreshToken.deleteMany();
    await db.user.deleteMany();
  });

  afterAll(async () => {
    await db.refreshToken.deleteMany();
    await db.user.deleteMany();
  });

  const testUser = {
    name: "Test User",
    email: "test@test.com",
    password: "hashedpassword",
  };

  it("create refresh token record in DB", async () => {
    const createdUser = await userRepo.createUser(
      testUser.email,
      testUser.name,
      testUser.password,
    );

    const token = await authService.createRefreshToken(
      { name: createdUser.name, email: createdUser.email },
      "7d",
    );

    expect(token).toBeDefined();

    const decoded = jwt.verify(token, refreshSecret!);
    expect(decoded).toHaveProperty("email", testUser.email);

    const storedToken = await refreshTokenRepo.getRefreshToken(token);

    expect(storedToken).not.toBeNull();
    expect(storedToken?.userId).toBe(createdUser.id);
  });

  it("throw error if user does not exist", async () => {
    const createToken = async () => {
      await authService.createRefreshToken(
        { name: "Ghost", email: "ghost@test.com" },
        "7d",
      );
    };

    await expect(createToken).rejects.toThrowError();
  });
});
