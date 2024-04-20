import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test('check no rooms with more than one person', async ({ page }) => {
    await page.goto('http://127.0.0.1:31000/api/login?key=will&user=will&role=admin');
    await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
    await expect(page.getByRole('list')).toContainText('Admin');
    await page.getByRole('link', { name: 'Admin' }).click();
    await expect(page.getByRole('heading', { name: 'No Rooms with More than One' })).toBeVisible();
    await expect(page.getByRole('heading')).toContainText('No Rooms with More than One Person Yet');
});


test('check deleting room kicks users out of waiting', async ({ browser }) => {
    const pageContext = await browser.newContext();
    const page1Context = await browser.newContext();
    const page2Context = await browser.newContext();
    const page = await pageContext.newPage()
    const page1 = await page1Context.newPage()
    const page2 = await page2Context.newPage()
    await page.goto('http://127.0.0.1:31000/api/login?key=will&user=will0&role=admin');
    await page1.goto('http://127.0.0.1:31000/api/login?key=will&user=chan0&role=player');
    await page2.goto('http://127.0.0.1:31000/api/login?key=will&user=connie0&role=player');
    await page1.getByPlaceholder('Enter Room Code').click();
    await page1.getByPlaceholder('Enter Room Code').fill('31');
    await page1.getByRole('button', { name: 'Join' }).click();
    await expect(page1.locator('h1')).toContainText('Room 31');
    await expect(page1.getByRole('paragraph')).toContainText('I am Player chan0');
    
    await page2.getByPlaceholder('Enter Room Code').click();
    await page2.getByPlaceholder('Enter Room Code').fill('31');
    await page2.getByRole('button', { name: 'Join' }).click();
    await page.getByRole('link', { name: 'Admin' }).click();
    await expect(page2.locator('h1')).toContainText('Room 31');
    await expect(page2.getByRole('paragraph')).toContainText('I am Player connie0');

    await expect(page1.locator('#app')).toContainText('Player chan0');
    await expect(page1.locator('#app')).toContainText('Player connie0');
    await expect(page2.locator('#app')).toContainText('Player chan0');
    await expect(page2.locator('#app')).toContainText('Player connie0');

    await expect(page.getByText('Room 31 DELETE')).toBeVisible();
    page.once('dialog', dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.dismiss().catch(() => {});
    });
    // await page.locator('#div :text(" Room 31 ")').locator('button').click();
    await page.getByText('Room 31 DELETE').getByRole('button', { name: 'DELETE' }).click()
    await page1.waitForURL("http://127.0.0.1:31000");
    await page2.waitForURL("http://127.0.0.1:31000");
});



test('check deleting room kicks users out of game', async ({ browser }) => {
    const pageContext = await browser.newContext();
    const page1Context = await browser.newContext();
    const page2Context = await browser.newContext();
    const page = await pageContext.newPage()
    const page1 = await page1Context.newPage()
    const page2 = await page2Context.newPage()
    await page.goto('http://127.0.0.1:31000/api/login?key=will&user=will1&role=admin');
    await page1.goto('http://127.0.0.1:31000/api/login?key=will&user=chan1&role=player');
    await page2.goto('http://127.0.0.1:31000/api/login?key=will&user=connie1&role=player');

    await expect(page.getByRole('list')).toContainText('Admin');
    await page.getByRole('link', { name: 'Admin' }).click();

    await page1.getByPlaceholder('Enter Room Code').click();
    await page1.getByPlaceholder('Enter Room Code').fill('32');
    await page1.getByRole('button', { name: 'Join' }).click();
    await page2.getByPlaceholder('Enter Room Code').click();
    await page2.getByPlaceholder('Enter Room Code').fill('32');
    await page2.getByRole('button', { name: 'Join' }).click();

    await page1.getByRole('button', { name: 'Start Game' }).click();
    await expect(page1.getByText('New GameRoom ID: 32My ID: chan1Current Phase: preflopLast Winner:Pot Amount: $')).toBeVisible();
    await expect(page2.getByText('New GameRoom ID: 32My ID: connie1Current Phase: preflopLast Winner:Pot Amount: $')).toBeVisible();

    await page.goto('http://127.0.0.1:31000/admin');
    await expect(page.getByText('Room 32 DELETE')).toBeVisible();
    page.once('dialog', dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.dismiss().catch(() => {});
    });
    await page.getByText('Room 32 DELETE').getByRole('button', { name: 'DELETE' }).click()

    await page1.waitForURL("http://127.0.0.1:31000");
    await page2.waitForURL("http://127.0.0.1:31000");
});

