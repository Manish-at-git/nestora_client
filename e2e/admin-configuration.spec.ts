import { expect, test, type Page } from "@playwright/test";

const baseUrl = process.env.E2E_BASE_URL ?? "http://localhost:5173";
const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const hasAdminCredentials = Boolean(adminEmail && adminPassword);

async function signInAsAdmin(page: Page): Promise<void> {
  await page.goto(`${baseUrl}/signin`);
  await page.getByTestId("signin-email").fill(adminEmail!);
  await page.getByTestId("signin-password").fill(adminPassword!);
  await page.getByTestId("signin-submit").click();
  await expect(page).not.toHaveURL(/\/signin(?:\?.*)?$/);
}

async function expectAdminConfigurationPage(
  page: Page,
  path: string,
  heading: string,
  searchPlaceholder: string,
): Promise<void> {
  await page.goto(`${baseUrl}${path}`);
  await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  await expect(page.getByPlaceholder(searchPlaceholder)).toBeVisible();
}

test.describe("administration configuration pages", () => {
  test.skip(
    !hasAdminCredentials,
    "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run authenticated administration checks.",
  );

  test.beforeEach(async ({ page }) => {
    await signInAsAdmin(page);
  });

  test("shows entity types", async ({ page }) => {
    await expectAdminConfigurationPage(
      page,
      "/entity-types",
      "Entity Types",
      "Search entity types...",
    );
  });

  test("shows entities", async ({ page }) => {
    await expectAdminConfigurationPage(page, "/entities", "Entities", "Search entities...");
  });

  test("shows roles", async ({ page }) => {
    await expectAdminConfigurationPage(page, "/roles", "Roles", "Search roles...");
  });

  test("shows features", async ({ page }) => {
    await expectAdminConfigurationPage(page, "/features", "Features", "Search features...");
  });

  test("shows the permissions matrix entry point", async ({ page }) => {
    await expectAdminConfigurationPage(
      page,
      "/permissions",
      "Permissions",
      "Search roles by name, code or entity...",
    );
  });
});
