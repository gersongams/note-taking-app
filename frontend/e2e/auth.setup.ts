import { randomUUID } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { expect, test as setup } from "@playwright/test";

const authFile = "playwright/.auth/user.json";
const defaultPassword = process.env.E2E_TEST_USER_PASSWORD ?? "Playwright123!";

type SeedCategory = {
  id: string;
  name: string;
};

type CategoriesResponse = SeedCategory[] | { results?: SeedCategory[] };

function toCategoryArray(data: unknown): SeedCategory[] {
  if (Array.isArray(data)) {
    return data.filter(
      (item): item is SeedCategory =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as { id?: unknown }).id === "string" &&
        typeof (item as { name?: unknown }).name === "string",
    );
  }

  if (
    data &&
    typeof data === "object" &&
    "results" in data &&
    Array.isArray((data as { results?: unknown }).results)
  ) {
    return toCategoryArray((data as { results: unknown }).results);
  }

  return [];
}

setup("create authenticated storage state", async ({ page, request }) => {
  const authDir = path.dirname(authFile);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const email =
    process.env.E2E_TEST_USER_EMAIL ?? `e2e+${randomUUID()}@example.com`;

  await page.goto("/auth/signup");
  await page.waitForLoadState("networkidle");

  await page.getByPlaceholder(/email address/i).fill(email);
  await page.getByPlaceholder(/password/i).fill(defaultPassword);
  await page.getByRole("button", { name: /sign up/i }).click();

  await page.waitForURL(/\/auth\/login$/);

  await page.getByLabel(/email address/i).fill(email);
  await page.getByLabel(/password/i).fill(defaultPassword);
  await page.getByRole("button", { name: /^login$/i }).click();

  await page.waitForLoadState("networkidle");

  await expect(page.getByRole("button", { name: /new note/i })).toBeVisible({
    timeout: 15000,
  });

  const cookies = await page.context().cookies();
  console.log(
    "[SETUP] Available cookies:",
    cookies.map((c) => c.name),
  );
  const accessTokenCookie = cookies.find((c) => c.name === "access_token");

  if (!accessTokenCookie) {
    console.error("[SETUP] ERROR: No access_token cookie found!");
    throw new Error("Authentication failed - no access token cookie");
  }

  console.log("[SETUP] access_token cookie found, proceeding with seeding");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  console.log("[SETUP] API URL:", apiUrl);

  console.log("[SETUP] Fetching existing categories");
  const categoriesResponse = await request.get(
    `${apiUrl}/api/notes/categories/`,
    {
      headers: {
        Authorization: `Bearer ${accessTokenCookie.value}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!categoriesResponse.ok()) {
    console.error(
      "[SETUP] Failed to fetch categories:",
      categoriesResponse.status(),
    );
    throw new Error("Failed to fetch categories");
  }

  const categoriesData = (await categoriesResponse.json()) as CategoriesResponse;
  const createdCategories = toCategoryArray(categoriesData);
  console.log(
    "[SETUP] Fetched categories:",
    createdCategories.length,
    createdCategories.map((category) => category.name),
  );

  const randomThoughtsCategory = createdCategories.find(
    (c) => c.name === "Random Thoughts",
  );
  const workCategory = createdCategories.find((c) => c.name === "Work");
  const personalCategory = createdCategories.find((c) => c.name === "Personal");
  const ideasCategory = createdCategories.find((c) => c.name === "Ideas");

  if (randomThoughtsCategory) {
    console.log("[SETUP] Creating note: Grocery List");
    const response = await request.post(`${apiUrl}/api/notes/notes/`, {
      headers: {
        Authorization: `Bearer ${accessTokenCookie.value}`,
        "Content-Type": "application/json",
      },
      data: {
        title: "Grocery List",
        content: "Buy milk, eggs, bread, and coffee",
        category: randomThoughtsCategory.id,
      },
    });
    console.log("[SETUP] Grocery List creation status:", response.status());
    if (!response.ok()) {
      console.error(
        "[SETUP] Failed to create Grocery List:",
        await response.text(),
      );
    }

    console.log("[SETUP] Creating note: Weekend Plans");
    const response2 = await request.post(`${apiUrl}/api/notes/notes/`, {
      headers: {
        Authorization: `Bearer ${accessTokenCookie.value}`,
        "Content-Type": "application/json",
      },
      data: {
        title: "Weekend Plans",
        content: "Go hiking on Saturday, movie night on Sunday",
        category: randomThoughtsCategory.id,
      },
    });
    console.log("[SETUP] Weekend Plans creation status:", response2.status());
    if (!response2.ok()) {
      console.error(
        "[SETUP] Failed to create Weekend Plans:",
        await response2.text(),
      );
    }
  }

  if (workCategory) {
    await request.post(`${apiUrl}/api/notes/notes/`, {
      headers: {
        Authorization: `Bearer ${accessTokenCookie.value}`,
        "Content-Type": "application/json",
      },
      data: {
        title: "Meeting Notes",
        content: "Discussed Q4 planning and team goals",
        category: workCategory.id,
      },
    });

    await request.post(`${apiUrl}/api/notes/notes/`, {
      headers: {
        Authorization: `Bearer ${accessTokenCookie.value}`,
        "Content-Type": "application/json",
      },
      data: {
        title: "Sprint Planning",
        content: "Review backlog items and assign tasks for next sprint",
        category: workCategory.id,
      },
    });
  }

  if (personalCategory) {
    await request.post(`${apiUrl}/api/notes/notes/`, {
      headers: {
        Authorization: `Bearer ${accessTokenCookie.value}`,
        "Content-Type": "application/json",
      },
      data: {
        title: "Fitness Goals",
        content: "Run 5km three times a week, join yoga class",
        category: personalCategory.id,
      },
    });

    await request.post(`${apiUrl}/api/notes/notes/`, {
      headers: {
        Authorization: `Bearer ${accessTokenCookie.value}`,
        "Content-Type": "application/json",
      },
      data: {
        title: "Book Reading List",
        content: "Atomic Habits, Deep Work, The Lean Startup",
        category: personalCategory.id,
      },
    });
  }

  if (ideasCategory) {
    await request.post(`${apiUrl}/api/notes/notes/`, {
      headers: {
        Authorization: `Bearer ${accessTokenCookie.value}`,
        "Content-Type": "application/json",
      },
      data: {
        title: "Project Ideas",
        content: "New app concept for productivity tracking",
        category: ideasCategory.id,
      },
    });

    await request.post(`${apiUrl}/api/notes/notes/`, {
      headers: {
        Authorization: `Bearer ${accessTokenCookie.value}`,
        "Content-Type": "application/json",
      },
      data: {
        title: "Blog Post Topics",
        content: "Write about Next.js 15 features, Django REST framework tips",
        category: ideasCategory.id,
      },
    });
  }

  console.log("[SETUP] Seeding completed successfully");

  await page.context().storageState({ path: authFile });
});
