import { describe, expect, it } from "vitest";
import {
  createNetworkError,
  isNetworkError,
} from "@/lib/network-error";

describe("network error helpers", () => {
  it("marks errors created via helper as network errors", () => {
    const original = new Error("boom");
    const networkError = createNetworkError("Connection lost", original);

    expect(networkError).toBeInstanceOf(Error);
    expect(networkError.message).toBe("Connection lost");
    expect(networkError.isNetworkError).toBe(true);
    expect(networkError.originalError).toBe(original);
    expect(isNetworkError(networkError)).toBe(true);
  });

  it("returns false for regular errors", () => {
    expect(isNetworkError(new Error("plain"))).toBe(false);

    const impostor = { isNetworkError: true };
    expect(isNetworkError(impostor)).toBe(false);
  });
});
