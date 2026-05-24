import { describe, it, expect, vi, beforeEach } from "vitest";

import * as userController from "../../controllers/userController";
import * as userRepo from "../../repositories/userRepository";

vi.mock(import("../../repositories/userRepository"));

function createMockRequest({
  body = {},
  user = {},
  params = {},
  query = {},
} = {}) {
  return {
    body,
    user,
    params,
    query,
  };
}

function createMockResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ----- TESTING SEARCHBYUSERNAME CONTROLLER -----

describe("searchByUsername controller", () => {
  it("should return filtered users excluding the requesting user", async () => {
    const mockUsers = [
      {
        id: 1,
        email: "alice@test.com",
        name: "Alice",
      },
      {
        id: 2,
        email: "bob@test.com",
        name: "Bob",
      },
      {
        id: 3,
        email: "charlie@test.com",
        name: "Charlie",
      },
    ];

    vi.mocked(userRepo.getUserByName).mockResolvedValue(mockUsers as any);

    const req = createMockRequest({
      body: {
        name: "a",
      },
      user: {
        email: "alice@test.com",
      },
    });

    const res = createMockResponse();

    await userController.searchByUsername(req as any, res as any);

    expect(userRepo.getUserByName).toHaveBeenCalledWith("a");

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith([
      {
        id: 2,
        email: "bob@test.com",
        name: "Bob",
      },
      {
        id: 3,
        email: "charlie@test.com",
        name: "Charlie",
      },
    ]);
  });

  it("should return an empty array if only the requesting user is found", async () => {
    const mockUsers = [
      {
        id: 1,
        email: "alice@test.com",
        name: "Alice",
      },
    ];

    vi.mocked(userRepo.getUserByName).mockResolvedValue(mockUsers as any);

    const req = createMockRequest({
      body: {
        name: "Alice",
      },
      user: {
        email: "alice@test.com",
      },
    });

    const res = createMockResponse();

    await userController.searchByUsername(req as any, res as any);

    expect(userRepo.getUserByName).toHaveBeenCalledWith("Alice");

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith([]);
  });

  it("should return 500 if searching users fails", async () => {
    vi.mocked(userRepo.getUserByName).mockRejectedValue(
      new Error("Database error"),
    );

    const req = createMockRequest({
      body: {
        name: "Alice",
      },
      user: {
        email: "alice@test.com",
      },
    });

    const res = createMockResponse();

    await userController.searchByUsername(req as any, res as any);

    expect(userRepo.getUserByName).toHaveBeenCalledWith("Alice");

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Error searching users",
      }),
    );
  });
});

// ----- TESTING GETCURRENTUSER CONTROLLER -----

describe("getCurrentUser controller", () => {
  it("should return current user details", async () => {
    const mockUser = {
      id: 1,
      email: "alice@test.com",
      name: "Alice",
      password: "hashed-password",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(userRepo.getUserByEmail).mockResolvedValue(mockUser);

    const req = createMockRequest({
      user: {
        email: "alice@test.com",
      },
    });

    const res = createMockResponse();

    await userController.getCurrentUser(req as any, res as any);

    expect(userRepo.getUserByEmail).toHaveBeenCalledWith("alice@test.com");

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      name: "Alice",
      email: "alice@test.com",
    });
  });

  it("should return undefined fields if user is not found", async () => {
    vi.mocked(userRepo.getUserByEmail).mockResolvedValue(null);

    const req = createMockRequest({
      user: {
        email: "missing@test.com",
      },
    });

    const res = createMockResponse();

    await userController.getCurrentUser(req as any, res as any);

    expect(userRepo.getUserByEmail).toHaveBeenCalledWith("missing@test.com");

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      name: undefined,
      email: undefined,
    });
  });

  it("should return 500 if fetching current user fails", async () => {
    vi.mocked(userRepo.getUserByEmail).mockRejectedValue(
      new Error("Database error"),
    );

    const req = createMockRequest({
      user: {
        email: "alice@test.com",
      },
    });

    const res = createMockResponse();

    await userController.getCurrentUser(req as any, res as any);

    expect(userRepo.getUserByEmail).toHaveBeenCalledWith("alice@test.com");

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Error fetching current user",
        code: "NO_USER_FOUND",
      }),
    );
  });
});
