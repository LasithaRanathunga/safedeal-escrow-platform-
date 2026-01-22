import { getTokenExpiry } from "../../services/authServices";
import {
  describe,
  expect,
  it,
  vi,
  assert,
  beforeEach,
  afterEach,
} from "vitest";

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
