import { describe, expect, it } from "vitest";
import { ZodError, z } from "zod";
import { formatZodErrors } from "@/lib/utils/format-zod-errors";

describe("formatZodErrors", () => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });

  it("groups issues by field", () => {
    const result = schema.safeParse({
      email: "not-an-email",
      password: "short",
    });

    expect(result.success).toBe(false);

    const errors = formatZodErrors(result.error as ZodError);

    expect(errors.email).toEqual(["Invalid email address"]);
    expect(errors.password).toEqual([
      "Too small: expected string to have >=8 characters",
    ]);
  });

  it("ignores issues without string paths", () => {
    const tupleSchema = z.tuple([z.string()]);
    const result = tupleSchema.safeParse([]);

    expect(result.success).toBe(false);
    const errors = formatZodErrors(result.error as ZodError);

    expect(errors).toEqual({});
  });
});
