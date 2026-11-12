import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const LOCALES = ['en', 'rw', 'fr'] as const;
const PATHS = ['', '/book', '/account/login', '/account/register', '/account/forgot-password'];
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

for (const locale of LOCALES) {
  for (const path of PATHS) {
    const url = `/${locale}${path}`;

    test.describe(url, () => {
      test('has no axe violations', async ({ page }) => {
        await page.goto(url);
        const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
        expect(results.violations).toEqual([]);
      });

      test('html lang matches the locale', async ({ page }) => {
        await page.goto(url);
        await expect(page.locator('html')).toHaveAttribute('lang', locale);
      });

      test('skip link is the first tab stop', async ({ page }) => {
        await page.goto(url);
        await page.keyboard.press('Tab');
        await expect(page.locator('a[href="#main"]')).toBeFocused();
      });

      test('no horizontal scroll at 320px wide', async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 800 });
        await page.goto(url);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(0);
      });
    });
  }
}

for (const locale of LOCALES) {
  test(`/${locale}: account pages that need sign-in redirect visitors to the sign-in page`, async ({ page }) => {
    for (const path of ['requests', 'settings']) {
      await page.goto(`/${locale}/account/${path}`);
      await expect(page).toHaveURL(new RegExp(`/${locale}/account/login`));
    }
  });
}

test.describe('/admin', () => {
  test('sign-in page has no axe violations', async ({ page }) => {
    await page.goto('/admin/login');
    const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    expect(results.violations).toEqual([]);
  });

  for (const path of ['/admin', '/admin/requests', '/admin/customers', '/admin/profile', '/admin/social', '/admin/account']) {
    test(`${path} redirects to sign-in when signed out`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/admin\/login$/);
    });
  }
});