import { describe, it, beforeAll, afterAll, expect } from "vitest";
import db from "../../db/db";
import * as refreshTokenRepository from "../../repositories/refreshTokenRepository";
import * as userRepository from "../../repositories/userRepository";

describe("RefreshToken Repository", () => {
  //   In Both
  //       BeforeAll
  //       AND
  //       AfterALL
  //   always clear the refreshtoken table before usrer table, otherwise it will violate the FOREIGN KEY constraint
  beforeAll(async () => {
    await db.refreshToken.deleteMany();
    await db.user.deleteMany();
  });
  afterAll(async () => {
    await db.refreshToken.deleteMany();
    await db.user.deleteMany();
  });

  const testRefreshToken = {
    token: "test-token",
    expiresAt: new Date(),
  };

  describe("createRefreshToken", () => {
    it("sucsessfully store the data in the database", async () => {
      const testUser = {
        name: "test User",
        email: "test@email.com",
        password: "testPassword",
      };
      //   create a test user because creating refreshToken without having user assosiated with userId which was used to create the test refreshToken can course a FOREIGN KEY constraint
      const createdUser = await userRepository.createUser(
        testUser.email,
        testUser.name,
        testUser.password,
      );

      const createdToken = await refreshTokenRepository.createRefreshToken(
        testRefreshToken.token,
        createdUser.id,
        testRefreshToken.expiresAt,
      );

      expect(createdToken).toMatchObject({
        ...testRefreshToken,
        userId: createdUser.id,
      });
    });

    it("throws an error when duplicated tokens are created", async () => {
      const testUser = {
        name: "test2 User",
        email: "test2@email.com",
        password: "test2Password",
      };

      const createdUser = await userRepository.createUser(
        testUser.email,
        testUser.name,
        testUser.password,
      );

      const createdToken = async function () {
        await refreshTokenRepository.createRefreshToken(
          testRefreshToken.token,
          createdUser.id,
          testRefreshToken.expiresAt,
        );
      };

      await expect(createdToken).rejects.toThrow("Unique constraint failed");
    });

    it("throws error if user already has a refresh token", async () => {
      const testUser = {
        name: "test3 User",
        email: "test3@email.com",
        password: "test3Password",
      };

      const createdUser = await userRepository.createUser(
        testUser.email,
        testUser.name,
        testUser.password,
      );

      await refreshTokenRepository.createRefreshToken(
        "testToken1",
        createdUser.id,
        testRefreshToken.expiresAt,
      );

      const createdToken = async () => {
        await refreshTokenRepository.createRefreshToken(
          "testToken2",
          createdUser.id,
          testRefreshToken.expiresAt,
        );
      };

      await expect(createdToken).rejects.toThrow(
        "Unique constraint failed on the fields: (`userId`)",
      );
    });

    it("throws an error if there are no users assosiated with the given userId", async () => {
      // clear the refreshtoken table avoid Unique constraint failier
      await db.refreshToken.deleteMany();

      const createdToken = async () => {
        await refreshTokenRepository.createRefreshToken(
          testRefreshToken.token,
          99999,
          testRefreshToken.expiresAt,
        );
      };

      await expect(createdToken).rejects.toThrow("Foreign key constraint");
    });
  });

  describe("getRefreshToken", () => {
    beforeAll(async () => {
      await db.refreshToken.deleteMany();
      await db.user.deleteMany();

      const testUser = {
        name: "test User",
        email: "test@email.com",
        password: "testPassword",
      };
      //   create a test user because creating refreshToken without having user assosiated with userId which was used to create the test refreshToken can course a FOREIGN KEY constraint
      const createdUser = await userRepository.createUser(
        testUser.email,
        testUser.name,
        testUser.password,
      );

      const createdToken = await refreshTokenRepository.createRefreshToken(
        testRefreshToken.token,
        createdUser.id,
        testRefreshToken.expiresAt,
      );
    });

    it("return tokoen if exist", async () => {
      const resovedToken = await refreshTokenRepository.getRefreshToken(
        testRefreshToken.token,
      );

      expect(resovedToken?.token).toBe(testRefreshToken.token);
    });

    it("return null if the token does not exist", async () => {
      const resovedToken = await refreshTokenRepository.getRefreshToken(
        "this_token_does_not_exist",
      );

      expect(resovedToken).toBeNull;
    });
  });
});
