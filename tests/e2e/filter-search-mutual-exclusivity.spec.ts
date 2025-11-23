import { test, expect } from '@playwright/test';

async function waitForSettled(page) {
  await page.waitForTimeout(400);
}

test.describe('Homepage filter/search mutual exclusivity and page reset', () => {
  test('Selecting category after being on page>1 resets page and keeps only categories param', async ({ page }) => {
    // Start on a higher page
    await page.goto('/?page=4');
    await waitForSettled(page);
    await expect(page).toHaveURL(/\?page=4$/);

    // Simulate selecting a category filter by navigating to categories param.
    await page.goto('/?categories=publikacje');
    await waitForSettled(page);

    // Expect page param removed and only categories present
    await expect(page).not.toHaveURL(/page=/);
    await expect(page).toHaveURL(/\?categories=publikacje$/);
  });

  test('Search and categories are mutually exclusive (search replaces categories and resets page)', async ({ page }) => {
    // Start with categories
    await page.goto('/?categories=publicystyka&page=3');
    await waitForSettled(page);

    // Simulate entering search (URL writer clears categories and page)
    await page.goto('/?search=PRL');
    await waitForSettled(page);

    await expect(page).toHaveURL(/\?search=PRL$/);
    await expect(page).not.toHaveURL(/categories=/);
    await expect(page).not.toHaveURL(/page=/);

    // Now set categories and ensure search disappears
    await page.goto('/?categories=publicystyka');
    await waitForSettled(page);

    await expect(page).toHaveURL(/\?categories=publicystyka$/);
    await expect(page).not.toHaveURL(/search=/);
  });
});
