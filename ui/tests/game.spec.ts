import { test, expect } from '@playwright/test';

test('game_phases_test', async ({ page, context }) => {
    const page1 = await context.newPage()
  await page.goto('https://www.google.com/');
  await page.goto('http://127.0.0.1:31000/api/login?key=will&user=player1&role=player');
  await page1.goto('http://127.0.0.1:31000/api/login?key=will&user=player2&role=player');
  await page.getByPlaceholder('Enter Room Code').click();
  await page.getByPlaceholder('Enter Room Code').fill('Test2');
  await page.getByRole('button', { name: 'Join' }).click();
  await page1.getByPlaceholder('Enter Room Code').click();
  await page1.getByPlaceholder('Enter Room Code').fill('Test2');
  await page1.getByRole('button', { name: 'Join' }).click();
  await page.getByRole('button', { name: 'Start Game' }).click();
  await page.getByText('preflop').click();
  await expect(page.getByRole('banner')).toContainText('preflop');
  await page.getByRole('button', { name: 'Call $' }).click();
  await page1.getByRole('button', { name: 'Check' }).click();
  await expect(page1.getByRole('banner')).toContainText('flop');
  await page.getByRole('button', { name: 'Check' }).click();
  await page1.getByRole('button', { name: 'Check' }).click();
  await expect(page1.getByRole('banner')).toContainText('turn');
  await page.getByRole('button', { name: 'Check' }).click();
  await page1.getByRole('button', { name: 'Check' }).click();
  await expect(page1.getByRole('banner')).toContainText('river');
});


test('call_raise_button_test', async ({ page, context }) => {
    const page1 = await context.newPage()

  await page.goto('https://www.google.com/');
  await page.goto('http://127.0.0.1:31000/api/login?key=will&user=player1&role=player');
  await page1.goto('http://127.0.0.1:31000/api/login?key=will&user=player2&role=player');

  await page.getByPlaceholder('Enter Room Code').click();
  await page.getByPlaceholder('Enter Room Code').fill('Test0');
  await page.getByRole('button', { name: 'Join' }).click();
  await page1.getByPlaceholder('Enter Room Code').click();
  await page1.getByPlaceholder('Enter Room Code').fill('Test0');
  await page1.getByRole('button', { name: 'Join' }).click();
  await page.getByRole('button', { name: 'Start Game' }).click();
  await page.getByRole('button', { name: 'Call $' }).click();
  await expect(page.locator('#app')).toContainText('You have $480');
  await page1.getByPlaceholder('Raise amount').click();
  await page1.getByPlaceholder('Raise amount').fill('50');
  await page1.getByRole('button', { name: 'Raise' }).click();
  await expect(page1.locator('#app')).toContainText('You have $430');
});


test('fold_button_test', async ({ page, context }) => {
    const page1 = await context.newPage()

  await page.goto('https://www.google.com/');
  await page.goto('http://127.0.0.1:31000/api/login?key=will&user=player1&role=player');
  await page1.goto('http://127.0.0.1:31000/api/login?key=will&user=player2&role=player');

  await page.getByPlaceholder('Enter Room Code').click();
  await page.getByPlaceholder('Enter Room Code').fill('Test1');
  await page.getByRole('button', { name: 'Join' }).click();
  await page1.getByPlaceholder('Enter Room Code').click();
  await page1.getByPlaceholder('Enter Room Code').fill('Test1');
  await page1.getByRole('button', { name: 'Join' }).click();
  await page.getByRole('button', { name: 'Start Game' }).click();
  await page.getByRole('button', { name: 'Call $' }).click();
  await page1.getByRole('button', { name: 'Check' }).click();
  await page.getByRole('button', { name: 'Fold' }).click();
  await expect(page.locator('#app')).toContainText('player2');
});



test('check one player', async ({ page }) => {
  await page.goto('https://www.google.com/');
  await page.goto('http://127.0.0.1:31000/api/login?key=will&user=player1&role=player');
  await page.getByPlaceholder('Enter Room Code').click();
  await page.getByPlaceholder('Enter Room Code').fill('Test3');
  await page.getByRole('button', { name: 'Join' }).click();
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Start Game' }).click();
  await expect(page.getByRole('button', { name: 'Start Game' })).toBeVisible();
});