import { describe, expect, it, vi } from "vitest";
import type { UseFormReturn } from "react-hook-form";
import { setFormErrors } from "@/lib/utils/set-form-errors";

type FormValues = {
  email: string;
  password: string;
};

describe("setFormErrors", () => {
  it("delegates server messages to react-hook-form", () => {
    const setError = vi.fn();
    const form = { setError } as unknown as UseFormReturn<FormValues>;

    setFormErrors({
      form,
      errors: {
        email: ["Invalid email address", "Already taken"],
        password: ["Too short"],
      },
    });

    expect(setError).toHaveBeenCalledTimes(2);
    expect(setError).toHaveBeenNthCalledWith(1, "email", {
      type: "server",
      message: "Invalid email address, Already taken",
    });
    expect(setError).toHaveBeenNthCalledWith(2, "password", {
      type: "server",
      message: "Too short",
    });
  });

  it("handles empty error maps gracefully", () => {
    const setError = vi.fn();
    const form = { setError } as unknown as UseFormReturn<FormValues>;

    setFormErrors({ form, errors: {} });
    expect(setError).not.toHaveBeenCalled();
  });
});
