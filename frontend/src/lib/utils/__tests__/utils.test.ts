import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("concatenates unique class names", () => {
    expect(cn("text-sm", "font-bold")).toBe("text-sm font-bold");
  });

  it("resolves conflicts using tailwind-merge rules", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-left", false && "text-right")).toBe("text-left");
  });
});
