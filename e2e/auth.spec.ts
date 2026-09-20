import { test, expect } from '@playwright/test';

test('click sign in with email and log in', async ({ page }) => {
  // 1. Go to your local dev server landing page
  await page.goto('http://localhost:3001');

  // 2. Wait for the "Sign in with email" button/link to be visible and click it
  const emailSignInLink = page.getByRole('link', { name: /sign in with email/i });
  await emailSignInLink.waitFor({ state: 'visible', timeout: 5000 });
  await emailSignInLink.click();

  // 3. Fill in email and password fields on the email login view
  await page.getByPlaceholder(/email/i).fill('admin@nestora.com');
  await page.getByPlaceholder(/password/i).fill('SecurePassword123');

  // 4. Submit the form
  await page.getByRole('button', { name: /sign in|log in/i }).click();
});