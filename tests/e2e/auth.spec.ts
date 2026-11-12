import { test, expect } from '@playwright/test';

test.describe('account menu and Google sign-in endpoints', () => {
  test('the "who am I" endpoint says signed out, and is never cached', async ({ request }) => {
    const response = await request.get('/api/account/me');
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ signedIn: false });
    expect(response.headers()['cache-control']).toContain('no-store');
  });

  test('the Google callback refuses a visit that did not start with us', async ({ request }) => {
    const response = await request.get('/api/auth/google/callback?code=abc&state=forged', { maxRedirects: 0 });
    expect(response.status()).toBe(302);
    expect(response.headers()['location']).toContain('/account/login?error=google');
  });

  test('the header shows a sign-in icon for visitors who are signed out', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('header a[href="/en/account/login"]').first()).toBeVisible();
  });
});