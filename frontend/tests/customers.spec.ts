import { expect, test } from '@playwright/test';

import { login } from './helpers';

test('customer search returns expected result', async ({ page }) => {
  await login(page);
  await page.goto('/dashboard/customers');

  const searchInput = page.getByTestId('customer-search-input');
  await searchInput.fill('Alice');
  await expect(page.locator('tr', { hasText: 'Alice Johnson' }).first()).toBeVisible();
});

test('customer search empty result is handled', async ({ page }) => {
  await login(page);
  await page.goto('/dashboard/customers');

  const searchInput = page.getByTestId('customer-search-input');
  await searchInput.fill('no-such-customer');
  await expect(page.getByText('Alice Johnson')).toHaveCount(0);
});
