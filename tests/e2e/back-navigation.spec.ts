import { test, expect } from '@playwright/test';

// Helper: wait for network idle-ish
async function waitForSettled(page) {
  await page.waitForTimeout(400);
}

test.describe('Back navigation preserves page and totals', () => {
  test('Homepage: go to page 2, open article, go back -> stays on page 2', async ({ page }) => {
    await page.goto('/');

    // Go to page 2 via pagination control if present; or set query directly
    await page.goto('/?page=2');

    // Wait some time for data and logs to settle
    await waitForSettled(page);

    // Assert URL has page=2
    await expect(page).toHaveURL(/\?page=2$/);

    // Click first article link (anchor pointing to a news article)
    const firstLink = page.locator('a[href^="/news/"]').first();
    await firstLink.waitFor({ state: 'visible' });
    await firstLink.click();

    // Ensure we navigated to news details
    await expect(page).toHaveURL(/\/news\//);

    // Go back
    await page.goBack();

    // Wait, then verify URL and that pagination still shows page=2 in the query
    await waitForSettled(page);
    await expect(page).toHaveURL(/\?page=2$/);
  });

  test('Category feed: go to page 2, open article, go back -> stays on page 2', async ({ page }) => {
    // Pick a known category slug path; adjust if needed
    const categorySlug = 'alarm-studencki';
    await page.goto(`/category/${categorySlug}?page=2`);

    await waitForSettled(page);
    await expect(page).toHaveURL(new RegExp(`/category/${categorySlug}\\?page=2$`));

    // Wait for at least one article link and click it
    const articleLinks = page.locator('a[href^="/news/"]');
    await expect(articleLinks.first()).toBeVisible();
    await articleLinks.first().click();

    await expect(page).toHaveURL(/\/news\//);

    await page.goBack();
    await waitForSettled(page);

    await expect(page).toHaveURL(new RegExp(`/category/${categorySlug}\\?page=2$`));
  });
});
