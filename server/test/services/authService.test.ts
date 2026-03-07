import { getTokenExpiry } from "../../services/authServices";
import {
  describe,
  expect,
  it,
  vi,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from "vitest";
import jwt from "jsonwebtoken";

import * as userRepo from "../../repositories/userRepository";
import * as cryproService from "../../services/cryptoService";
import * as authService from "../../services/authServices";
import * as refreshTokenRepo from "../../repositories/refreshTokenRepository";
import db from "../../db/db";

describe("getTokenExpiry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns correct expiry date for seconds", () => {
    const expiry = getTokenExpiry("30s");
    expect(expiry).toEqual(new Date("2025-01-01T00:00:30Z"));
  });

  it("returns correct expiry date for minuts", () => {
    const expiry = getTokenExpiry("15m");
    expect(expiry).toEqual(new Date("2025-01-01T00:15:00Z"));
  });

  it("returns correct expiry date for hours", () => {
    const expiry = getTokenExpiry("2h");
    expect(expiry).toEqual(new Date("2025-01-01T02:00:00Z"));
  });

  it("returns correct expiry date for days", () => {
    const expiry = getTokenExpiry("7d");
    expect(expiry).toEqual(new Date("2025-01-08T00:00:00Z"));
  });

  it("throws an error for invalid format", () => {
    const expiryErr = () => getTokenExpiry("10x");

    expect(expiryErr).toThrow(
      "Invalid duration format. Input should be like '15m', '2h', '7d'.",
    );
  });

  it("throws error for empty string", () => {
    expect(() => getTokenExpiry("")).toThrow(
      "Invalid duration format. Input should be like '15m', '2h', '7d'.",
    );
  });

  it("throws error for missing unit", () => {
    expect(() => getTokenExpiry("10")).toThrow(
      "Invalid duration format. Input should be like '15m', '2h', '7d'.",
    );
  });
});

describe("createUser", () => {
  const testUser = {
    email: "user@test.com",
    name: "Test User",
    password: "plainPassword",
    createdAt: new Date(),
    updatedAt: new Date(),
    id: 1,
  };

  it("hashes the given password and call the userRepository.createUser with the hashed password", async () => {
    const hashedPassword = "hashedPassword";

    const hashMock = vi
      .spyOn(cryproService, "hashPassword")
      .mockResolvedValue("hashedPassword");

    const repoMock = vi
      .spyOn(userRepo, "createUser")
      .mockResolvedValue({ ...testUser, password: hashedPassword });

    const createdUser = await authService.createUser(
      testUser.email,
      testUser.name,
      testUser.password,
    );

    expect(hashMock).toHaveBeenCalledWith(testUser.password, 10);
    expect(repoMock).toHaveBeenCalledWith(
      testUser.email,
      testUser.name,
      hashedPassword,
    );
    expect(createdUser.password).toBe(hashedPassword);

    hashMock.mockRestore();
    repoMock.mockRestore();
  });

  it("throws an error if userRepo.createUser failed", async () => {
    const createUserMock = vi
      .spyOn(userRepo, "createUser")
      .mockRejectedValue(new Error("Database Failier"));

    const createdUser = async function () {
      await authService.createUser(
        testUser.email,
        testUser.name,
        testUser.password,
      );
    };

    await expect(createdUser).rejects.toThrow("Database Failier");
  });
});

describe("ifRefrechTokenExists", () => {
  it("Returns true if refresh token exist", async () => {
    const getRefreshTokenMock = vi
      .spyOn(refreshTokenRepo, "getRefreshToken")
      .mockResolvedValue({
        id: 1,
        token: "test_token",
        userId: 5,
        createdAt: new Date(),
        expiresAt: new Date(),
      });

    const ifRefreshTokenExist =
      await authService.ifRefrechTokenExists("test_token");

    expect(ifRefreshTokenExist).toBe(true);
  });

  it("Returns false it refresh token does not exist", async () => {
    const getRefreshTokenMock = vi
      .spyOn(refreshTokenRepo, "getRefreshToken")
      .mockResolvedValue(null);

    const ifRefreshTokenExist =
      await authService.ifRefrechTokenExists("test_token");

    expect(ifRefreshTokenExist).toBe(false);
  });

  it("throw an error id getRefreshToken throw an error", async () => {
    const getRefreshTokenMock = vi
      .spyOn(refreshTokenRepo, "getRefreshToken")
      .mockRejectedValue(new Error("Error in getRefreshToken"));

    const ifRefreshTokenExist = async () => {
      await authService.ifRefrechTokenExists("test_token");
    };

    await expect(ifRefreshTokenExist).rejects.toThrow(
      "Error in getRefreshToken",
    );
  });
});

describe("createRefreshToken", () => {
  const testUser = { name: "testUser", email: "test@email.com" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("create and store refresh token when user exists", async () => {
    vi.spyOn(jwt, "sign").mockReturnValue("mockedRefreshToken" as any);

    vi.spyOn(userRepo, "getUserByEmail").mockResolvedValue({
      id: "user123",
    } as any);

    const createRefreshSpy = vi
      .spyOn(refreshTokenRepo, "createRefreshToken")
      .mockResolvedValue({} as any);

    const result = await authService.createRefreshToken(testUser, "7d");

    expect(createRefreshSpy).toHaveBeenCalledWith(
      "mockedRefreshToken",
      "user123",
      expect.any(Date),
    );

    expect(result).toBe("mockedRefreshToken");
  });

  it("should NOT store refresh token if user does not exist", async () => {
    vi.spyOn(jwt, "sign").mockReturnValue("mockedRefreshToken" as any);

    vi.spyOn(userRepo, "getUserByEmail").mockResolvedValue(null);

    const createRefreshSpy = vi
      .spyOn(refreshTokenRepo, "createRefreshToken")
      .mockResolvedValue({} as any);

    const result = async () => {
      await authService.createRefreshToken(testUser, "7d");
    };

    await expect(result).rejects.toThrow("User does not exist");
    expect(createRefreshSpy).not.toHaveBeenCalled();
  });
});

describe("getAccessToken", () => {
  const testUser = {
    name: "testUser",
    email: "user@test.com",
    password: "testPass",
  };

  beforeAll(async () => {
    vi.restoreAllMocks();

    await db.refreshToken.deleteMany();
    await db.user.deleteMany();
    await authService.createUser(
      testUser.email,
      testUser.name,
      testUser.password,
    );
  });

  afterAll(async () => {
    await db.refreshToken.deleteMany();
    await db.user.deleteMany();
  });

  it("throw error if refresh token is invalid", async () => {
    const mockRefreshToken = "valid-refresh-token";

    await expect(
      authService.getAccessToken(testUser, mockRefreshToken),
    ).rejects.toThrow("Invalid refresh token");
  });

  it("generate access token if refresh token is valid", async () => {
    vi.spyOn(jwt, "sign").mockReturnValue("mocked-token" as any);

    const createdRefreshToken = await authService.createRefreshToken(
      {
        name: testUser.name,
        email: testUser.email,
      },
      "7d",
    );

    const result = await authService.getAccessToken(
      {
        name: testUser.name,
        email: testUser.email,
      },
      createdRefreshToken,
    );

    expect(result).toBe("mocked-token");

    expect(jwt.sign).toHaveBeenLastCalledWith(
      { name: testUser.name, email: testUser.email },
      expect.any(String),
      { expiresIn: "15m" },
    );
  });
});
