import { expect, test } from "@playwright/test";

const NOTE_TITLE_PLACEHOLDER = "Note Title";
const NOTE_CONTENT_PLACEHOLDER = "Pour your heart out...";

test.describe("Notes workspace", () => {
  test("renders seeded notes grid with categories", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify UI elements
    await expect(page.getByRole("button", { name: /new note/i })).toBeVisible();
    await expect(page.getByText("Grocery List")).toBeVisible();
    await expect(page.getByText("Meeting Notes")).toBeVisible();

    // Verify categories in sidebar
    await expect(
      page.getByRole("link", { name: /random thoughts/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /work/i })).toBeVisible();
  });

  test("opens a fresh note dialog when creating a note", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /new note/i }).click();

    const dialog = page.getByTestId("note-dialog");
    await dialog.waitFor({ state: "visible" });
    await expect(dialog.getByPlaceholder(NOTE_TITLE_PLACEHOLDER)).toHaveValue(
      "",
    );
    await expect(dialog.getByPlaceholder(NOTE_CONTENT_PLACEHOLDER)).toHaveValue(
      "",
    );

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("opens existing note in modal when a card is clicked", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const firstCard = page.locator('[data-slot="card"]').first();
    await firstCard.waitFor();
    const firstTitle =
      (
        await firstCard.locator('[data-slot="card-title"]').textContent()
      )?.trim() ?? "";

    await firstCard.click();

    // Wait for the active dialog (the intercept route can render two)
    const dialog = page.getByTestId("note-dialog").first();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByPlaceholder(NOTE_TITLE_PLACEHOLDER)).toHaveValue(
      firstTitle,
    );

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe("Shareable note routes", () => {
  test("deep-linking to a note opens the dialog immediately", async ({
    page,
  }) => {
    // First, get the actual note ID from the home page
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Find the "Grocery List" card and extract its URL
    const groceryCard = page
      .locator('[data-slot="card"]')
      .filter({ hasText: "Grocery List" });
    await groceryCard.waitFor();
    await groceryCard.click();

    // Get the current URL which should have the note ID
    const url = page.url();
    const match = url.match(/\/([a-z-]+)\/(\d+)$/);

    if (match) {
      const [, category, noteId] = match;

      // Now navigate directly to this URL
      await page.goto(`/${category}/${noteId}`);
      await page.waitForLoadState("networkidle");

      const dialog = page.getByTestId("note-dialog");
      await dialog.waitFor({ state: "visible" });
      await expect(dialog.getByPlaceholder(NOTE_TITLE_PLACEHOLDER)).toHaveValue(
        "Grocery List",
      );

      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(page).toHaveURL(new RegExp(`/${category}/?$`));
    }
  });

  test("category pages still allow creating new notes", async ({ page }) => {
    await page.goto("/random-thoughts");
    await page.waitForLoadState("networkidle");

    // Verify we're on the category page by checking URL and sidebar link is active
    await expect(page).toHaveURL(/\/random-thoughts$/);
    await expect(
      page.getByRole("link", { name: /random thoughts/i }),
    ).toBeVisible();

    // Verify New Note button is available
    await expect(page.getByRole("button", { name: /new note/i })).toBeVisible();

    await page.getByRole("button", { name: /new note/i }).click();
    const dialog = page.getByTestId("note-dialog");
    await dialog.waitFor({ state: "visible" });

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});
