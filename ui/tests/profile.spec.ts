import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://127.0.0.1:31000/api/login?key=will&user=will&role=player');
  await page.getByRole('link', { name: 'Profile' }).click();
  await page.getByPlaceholder('What is your name?').click();
  await page.getByPlaceholder('What is your name?').fill('will');
  await page.getByPlaceholder('What is your age').click();
  await page.getByPlaceholder('What is your age').fill('20');
  await page.getByPlaceholder('Tell us about yourself').click();
  await page.getByPlaceholder('Tell us about yourself').fill('hi!');
  await page.locator('[id="__BVID__28"]').click();
  await page.locator('[id="__BVID__28"]').setInputFiles('turtle.png');
  await page.getByRole('button', { name: 'SUBMIT' }).click();
  await expect(page.getByRole('img')).toBeVisible();
  await expect(page.locator('#app')).toContainText('Name: will');
  await expect(page.locator('#app')).toContainText('Age: 20');
  await expect(page.locator('#app')).toContainText('Bio: hi!');
  await page.getByRole('link', { name: 'Home' }).click();
  await page.getByRole('link', { name: 'Profile' }).click();
  await page.getByRole('link', { name: 'Logout' }).click();
});