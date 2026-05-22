import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcrypt";

import * as authController from "../../controllers/authController";
import * as authServices from "../../services/authServices";
import * as userRepo from "../../repositories/userRepository";
import * as refreshTokenRepo from "../../repositories/refreshTokenRepository";

vi.mock(import("../../services/authServices"));
vi.mock(import("../../repositories/userRepository"));
vi.mock(import("../../repositories/refreshTokenRepository"));
vi.mock(import("bcrypt"));

// ----- TESTING SIGNUP CONTROLLER -----
describe("signUp controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 if passwords do not match", async () => {
    const req = {
      body: {
        email: "test@test.com",
        fullname: "Alice",
        password: "1234",
        confirmpassword: "9999",
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await authController.signUp(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message: "Passwords do not match",
    });

    expect(authServices.createUser).not.toHaveBeenCalled();
  });

  it("should create user and return tokens", async () => {
    const mockUser = {
      id: 1,
      email: "test@test.com",
      password: "hashedpassword",
      name: "Alice",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(authServices.createUser).mockResolvedValue(mockUser as any);

    vi.mocked(authServices.createRefreshToken).mockResolvedValue(
      "refresh-token",
    );

    vi.mocked(authServices.getAccessToken).mockResolvedValue("access-token");

    const req = {
      body: {
        email: "test@test.com",
        fullname: "Alice",
        password: "1234",
        confirmpassword: "1234",
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await authController.signUp(req as any, res as any);

    expect(authServices.createUser).toHaveBeenCalledWith(
      "test@test.com",
      "Alice",
      "1234",
    );

    expect(authServices.createRefreshToken).toHaveBeenCalledWith(
      mockUser,
      "7d",
    );

    expect(authServices.getAccessToken).toHaveBeenCalledWith(
      mockUser,
      "refresh-token",
    );

    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith({
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });
  });

  it("should return 500 if user creation fails", async () => {
    vi.mocked(authServices.createUser).mockRejectedValue(new Error("DB Error"));

    const req = {
      body: {
        email: "test@test.com",
        fullname: "Alice",
        password: "12345678",
        confirmpassword: "12345678",
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await authController.signUp(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Error: user creation failed",
      }),
    );

    expect(authServices.createRefreshToken).not.toHaveBeenCalled();

    expect(authServices.getAccessToken).not.toHaveBeenCalled();
  });
});

// ----- TESTING LOGIN CONTROLLER -----

function createMockRequest(body = {}) {
  return {
    body,
  };
}

function createMockResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
}

describe("logIn controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 if user does not exist", async () => {
    vi.mocked(userRepo.getUserByEmail).mockResolvedValue(null);

    const req = createMockRequest({
      email: "test@test.com",
      password: "12345678",
    });

    const res = createMockResponse();

    await authController.logIn(req as any, res as any);

    expect(userRepo.getUserByEmail).toHaveBeenCalledWith("test@test.com");

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message: "User not found",
    });

    expect(bcrypt.compare).not.toHaveBeenCalled();

    expect(userRepo.deleteManyTokensOfUserId).not.toHaveBeenCalled();

    expect(authServices.createRefreshToken).not.toHaveBeenCalled();

    expect(authServices.getAccessToken).not.toHaveBeenCalled();
  });

  it("should return 400 if password is incorrect", async () => {
    const mockUser = {
      id: 1,
      email: "test@test.com",
      password: "hashed-password",
      name: "Alice",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(userRepo.getUserByEmail).mockResolvedValue(mockUser as any);

    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const req = createMockRequest({
      email: "test@test.com",
      password: "wrong-password",
    });

    const res = createMockResponse();

    await authController.logIn(req as any, res as any);

    expect(userRepo.getUserByEmail).toHaveBeenCalledWith("test@test.com");

    expect(bcrypt.compare).toHaveBeenCalledWith(
      "wrong-password",
      "hashed-password",
    );

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid email or password",
    });

    expect(userRepo.deleteManyTokensOfUserId).not.toHaveBeenCalled();

    expect(authServices.createRefreshToken).not.toHaveBeenCalled();

    expect(authServices.getAccessToken).not.toHaveBeenCalled();
  });

  it("should delete old refresh tokens and return new tokens", async () => {
    const mockUser = {
      id: 1,
      email: "test@test.com",
      password: "hashed-password",
      name: "Alice",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(userRepo.getUserByEmail).mockResolvedValue(mockUser as any);

    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    vi.mocked(userRepo.deleteManyTokensOfUserId).mockResolvedValue(undefined);

    vi.mocked(authServices.createRefreshToken).mockResolvedValue(
      "refresh-token",
    );

    vi.mocked(authServices.getAccessToken).mockResolvedValue("access-token");

    const req = createMockRequest({
      email: "test@test.com",
      password: "12345678",
    });

    const res = createMockResponse();

    await authController.logIn(req as any, res as any);

    expect(userRepo.getUserByEmail).toHaveBeenCalledWith("test@test.com");

    expect(bcrypt.compare).toHaveBeenCalledWith("12345678", "hashed-password");

    expect(userRepo.deleteManyTokensOfUserId).toHaveBeenCalledWith(1);

    expect(authServices.createRefreshToken).toHaveBeenCalledWith(
      mockUser,
      "7d",
    );

    expect(authServices.getAccessToken).toHaveBeenCalledWith(
      mockUser,
      "refresh-token",
    );

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });
  });

  it("should propagate error if getUserByEmail fails", async () => {
    vi.mocked(userRepo.getUserByEmail).mockRejectedValue(
      new Error("Database error"),
    );

    const req = createMockRequest({
      email: "test@test.com",
      password: "12345678",
    });

    const res = createMockResponse();

    await expect(authController.logIn(req as any, res as any)).rejects.toThrow(
      "Database error",
    );

    expect(res.status).not.toHaveBeenCalled();

    expect(res.json).not.toHaveBeenCalled();
  });

  it("should propagate error if bcrypt.compare fails", async () => {
    const mockUser = {
      id: 1,
      email: "test@test.com",
      password: "hashed-password",
      name: "Alice",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(userRepo.getUserByEmail).mockResolvedValue(mockUser as any);

    vi.mocked(bcrypt.compare).mockRejectedValue(new Error("Bcrypt error"));

    const req = createMockRequest({
      email: "test@test.com",
      password: "12345678",
    });

    const res = createMockResponse();

    await expect(authController.logIn(req as any, res as any)).rejects.toThrow(
      "Bcrypt error",
    );

    expect(userRepo.deleteManyTokensOfUserId).not.toHaveBeenCalled();

    expect(authServices.createRefreshToken).not.toHaveBeenCalled();

    expect(authServices.getAccessToken).not.toHaveBeenCalled();
  });
});

// ----- TESTING LOGOUT CONTROLLER -----

describe("logOut controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 if user does not exist", async () => {
    vi.mocked(userRepo.getUserByEmail).mockResolvedValue(null);

    const req = {
      user: {
        email: "test@test.com",
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await authController.logOut(req as any, res as any);

    expect(userRepo.getUserByEmail).toHaveBeenCalledWith("test@test.com");

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid email",
    });

    expect(refreshTokenRepo.deleteRefreshTokenOfUserId).not.toHaveBeenCalled();
  });

  it("should delete refresh tokens and return 200", async () => {
    const mockUser = {
      id: 1,
      email: "test@test.com",
      password: "hashed-password",
      name: "Alice",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(userRepo.getUserByEmail).mockResolvedValue(mockUser as any);

    vi.mocked(refreshTokenRepo.deleteRefreshTokenOfUserId).mockResolvedValue(
      undefined,
    );

    const req = {
      user: {
        email: "test@test.com",
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await authController.logOut(req as any, res as any);

    expect(userRepo.getUserByEmail).toHaveBeenCalledWith("test@test.com");

    expect(refreshTokenRepo.deleteRefreshTokenOfUserId).toHaveBeenCalledWith(1);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      message: "Logged out successfully",
    });
  });

  it("should return 500 if deleting refresh tokens fails", async () => {
    const mockUser = {
      id: 1,
      email: "test@test.com",
      password: "hashed-password",
      name: "Alice",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(userRepo.getUserByEmail).mockResolvedValue(mockUser as any);

    vi.mocked(refreshTokenRepo.deleteRefreshTokenOfUserId).mockRejectedValue(
      new Error("DB Error"),
    );

    const req = {
      user: {
        email: "test@test.com",
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await authController.logOut(req as any, res as any);

    expect(userRepo.getUserByEmail).toHaveBeenCalledWith("test@test.com");

    expect(refreshTokenRepo.deleteRefreshTokenOfUserId).toHaveBeenCalledWith(1);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Error in logging out",
      }),
    );
  });
});
