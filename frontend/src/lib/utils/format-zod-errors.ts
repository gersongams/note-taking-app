import type { ZodError, ZodIssue } from "zod";

export function formatZodErrors(error: ZodError): Record<string, string[]> {
  return error.issues.reduce<Record<string, string[]>>(
    (acc, issue: ZodIssue) => {
      const field = issue.path[0];
      if (typeof field !== "string") {
        return acc;
      }
      if (!acc[field]) {
        acc[field] = [];
      }
      acc[field].push(issue.message);
      return acc;
    },
    {},
  );
}
