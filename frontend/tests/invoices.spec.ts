import { expect, test } from '@playwright/test';

import { login } from './helpers';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formatUSD(amount: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount));
}

test('invoice create, update and delete flow works', async ({ page }) => {
  await login(page);

  const uniqueCents = String(Date.now() % 100).padStart(2, '0');
  const createdAmount = `1234.${uniqueCents}`;
  const updatedAmount = `2234.${uniqueCents}`;
  const createdAmountText = formatUSD(createdAmount);
  const updatedAmountText = formatUSD(updatedAmount);

  await page.goto('/dashboard/invoices/create');
  const customerSelect = page.locator('select[name="customerId"]');
  await expect(customerSelect).toBeVisible();
  await customerSelect.selectOption({ index: 1 });
  await page.locator('input[name="amount"]').fill(createdAmount);
  await page.locator('input#paid').check();
  await page.getByRole('button', { name: 'Create Invoice' }).click();
  await expect(page).toHaveURL(/\/dashboard\/invoices$/);

  const searchInput = page.getByTestId('invoice-search-input');
  await searchInput.fill(createdAmount);
  await expect(page).toHaveURL(
    new RegExp(
      `/dashboard/invoices\\?page=1&query=${escapeRegExp(createdAmount)}$`,
    ),
  );
  const createdRow = page.locator('tr', { hasText: createdAmountText }).first();
  await expect(createdRow).toBeVisible();

  await createdRow.getByTestId('invoice-edit-button').click();
  await expect(page).toHaveURL(/\/dashboard\/invoices\/.+\/edit$/);
  await page.locator('input[name="amount"]').fill(updatedAmount);
  await page.getByRole('button', { name: 'Update Invoice' }).click();
  await expect(page).toHaveURL(/\/dashboard\/invoices$/);

  await searchInput.fill(updatedAmount);
  await expect(page).toHaveURL(
    new RegExp(
      `/dashboard/invoices\\?page=1&query=${escapeRegExp(updatedAmount)}$`,
    ),
  );
  const updatedRow = page.locator('tr', { hasText: updatedAmountText }).first();
  await expect(updatedRow).toBeVisible();

  await updatedRow.getByTestId('invoice-delete-button').click();
  await expect(page.locator('tr', { hasText: updatedAmountText })).toHaveCount(0);
});

test('invoice edit page shows not found for missing invoice', async ({ page }) => {
  await login(page);
  await page.goto('/dashboard/invoices/00000000-0000-0000-0000-000000000000/edit');
  await expect(page.getByText('404 Not Found')).toBeVisible();
});
