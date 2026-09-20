// client/e2e/smoke.spec.ts
import { test, expect } from '@playwright/test';

test('has title and loads signin page', async ({ page }) => {
  // Go to your Vite local dev server
  await page.goto('http://localhost:3001');

  // Check that the page loads and contains your app title or a sign-in element
  await expect(page).toHaveTitle(/Nestora/i);
});