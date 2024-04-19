import { test, expect } from '@playwright/test';

test('this test should fail', async ({ page }) => {
    await page.goto('http://127.0.0.1:31000/api/login?key=will&user=fail&role=player');
    await expect(page.getByRole('link', { name: 'None' })).toBeVisible();
});
