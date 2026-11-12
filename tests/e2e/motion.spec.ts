import { test, expect } from '@playwright/test';

const ANIMATED = [
  '[data-motion="hero"] h1',
  '[data-motion="hero"] [data-step="media"]',
  '#services li',
  '#how li',
  '#about > div > *',
  '[data-motion="driver"]',
];

const animationName = (page: import('@playwright/test').Page, selector: string) =>
  page.locator(selector).first().evaluate((el) => getComputedStyle(el).animationName);

test.describe('when a visitor asks for reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('nothing on the homepage is animated', async ({ page }) => {
    await page.goto('/en');
    for (const selector of ANIMATED) {
      const names = await page.locator(selector).evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName));
      expect(names.length, `${selector} should exist`).toBeGreaterThan(0);
      expect(names.every((name) => name === 'none'), `${selector} should not animate`).toBe(true);
    }
  });

  test('smooth scrolling is off', async ({ page }) => {
    await page.goto('/en');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  });
});

test.describe('with normal motion', () => {
  test.use({ reducedMotion: 'no-preference' });

  // These fail if motion.css is not loaded or the data- attributes are missing
  test('the hero is wired to its animations', async ({ page }) => {
    await page.goto('/en');
    expect(await animationName(page, '[data-motion="hero"] h1')).toBe('rise');
    expect(await animationName(page, '[data-motion="hero"] [data-step="2"]')).toBe('rise');
    expect(await animationName(page, '[data-motion="hero"] [data-step="media"]')).toBe('slide-up');
  });

  test('smooth scrolling is on', async ({ page }) => {
    await page.goto('/en');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('smooth');
  });

  test('scroll-driven effects are wired up where the browser supports them', async ({ page }) => {
    await page.goto('/en');
    const supported = await page.evaluate(() => CSS.supports('animation-timeline: view()'));
    test.skip(!supported, 'This browser has no scroll-driven animations');
    expect(await animationName(page, '#services li')).toBe('reveal');
    expect(await animationName(page, '#how li')).toBe('reveal');
    expect(await animationName(page, '[data-motion="driver"]')).toBe('drive');
  });

  test('the hero text ends up fully visible', async ({ page }) => {
    await page.goto('/en');
    await page.waitForTimeout(1500);
    const opacity = await page.locator('[data-motion="hero"] h1').evaluate((el) => getComputedStyle(el).opacity);
    expect(opacity).toBe('1');
  });

  test('after scrolling, every card and step is visible', async ({ page }) => {
    await page.goto('/en');
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await page.waitForTimeout(700);
    for (const selector of ['#services li', '#how li', '#about > div > *']) {
      const opacities = await page.locator(selector).evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity));
      expect(opacities.length, `${selector} should exist`).toBeGreaterThan(0);
      expect(opacities.every((o) => o === '1'), `${selector} should be fully visible`).toBe(true);
    }
  });

  test('the page has no horizontal scroll while animations are active', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/en');
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await page.waitForTimeout(500);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});