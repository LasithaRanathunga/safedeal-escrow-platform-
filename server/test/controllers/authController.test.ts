import { describe, it, expect, vi, beforeEach } from "vitest";

import * as authController from "../../controllers/authController";

import * as authServices from "../../services/authServices";

vi.mock(import("../../services/authServices"));

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
