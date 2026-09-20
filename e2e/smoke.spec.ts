import { test, expect } from '@playwright/test';

test('has title and loads app', async ({ page }) => {
  await page.goto('http://localhost:3001');
  await expect(page).toHaveTitle(/Nestora/i);
});