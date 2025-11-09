import { expect, test } from "@playwright/test";

test.describe("Login page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");
  });

  test("validates empty submission", async ({ page }) => {
    await page.getByRole("button", { name: /^login$/i }).click();

    await expect(page.getByText("Invalid email address")).toBeVisible();
    await expect(
      page.getByText("Password must be at least 6 characters"),
    ).toBeVisible();
  });

  test("has CTA to the sign up page", async ({ page }) => {
    await page.getByRole("link", { name: /never been here before/i }).click();
    await expect(page).toHaveURL(/\/auth\/signup$/);
  });
});

test.describe("Sign up page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/signup");
    await page.waitForLoadState("networkidle");
  });

  test("validates empty submission", async ({ page }) => {
    await page.getByRole("button", { name: /sign up/i }).click();

    await expect(page.getByText("Invalid email address")).toBeVisible();
    await expect(
      page.getByText("Password must be at least 6 characters"),
    ).toBeVisible();
  });

  test("links back to login", async ({ page }) => {
    await page.getByRole("link", { name: /already friends/i }).click();
    await expect(page).toHaveURL(/\/auth\/login$/);
  });
});
