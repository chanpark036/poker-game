import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });


test('multiple_rooms_test', async ({ page, context }) => {
    const page1 = await context.newPage()
    const page2 = await context.newPage()
    const page3 = await context.newPage()

  await page.goto('https://www.google.com/');
  await page.goto('http://127.0.0.1:31000/api/login?key=will&user=player1&role=player');
  await page1.goto('http://127.0.0.1:31000/api/login?key=will&user=player2&role=player');
  await page2.goto('http://127.0.0.1:31000/api/login?key=will&user=player3&role=player');
  await page3.goto('http://127.0.0.1:31000/api/login?key=will&user=player4&role=player');
  await page.getByPlaceholder('Enter Room Code').click();
  await page.getByPlaceholder('Enter Room Code').fill('RoomTest1');
  await page.getByRole('button', { name: 'Join' }).click();
  await page1.getByPlaceholder('Enter Room Code').click();
  await page1.getByPlaceholder('Enter Room Code').fill('RoomTest1');
  await page1.getByRole('button', { name: 'Join' }).click();
  await page2.getByPlaceholder('Enter Room Code').click();
  await page2.getByPlaceholder('Enter Room Code').fill('RoomTest2');
  await page2.getByRole('button', { name: 'Join' }).click();
  await page3.getByPlaceholder('Enter Room Code').click();
  await page3.getByPlaceholder('Enter Room Code').fill('RoomTest2');
  await page3.getByRole('button', { name: 'Join' }).click();
  await page.getByRole('button', { name: 'Start Game' }).click();
  await expect(page.getByText('New GameRoom ID: RoomTest1My')).toBeVisible();
  await expect(page1.getByText('New GameRoom ID: RoomTest1My')).toBeVisible();
  await expect(page2.getByRole('button', { name: 'Start Game' })).toBeVisible();
  await expect(page3.getByRole('button', { name: 'Start Game' })).toBeVisible();
  await page3.getByRole('button', { name: 'Start Game' }).click();
  await expect(page2.getByText('New GameRoom ID: RoomTest2My')).toBeVisible();
  await expect(page3.getByText('New GameRoom ID: RoomTest2My')).toBeVisible();
});
