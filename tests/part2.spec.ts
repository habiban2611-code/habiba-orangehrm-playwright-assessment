import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { PimPage } from '../pages/PimPage';

test('searching an unknown employee ID shows an empty state; reset restores results', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  const pimPage = new PimPage(page);

  await loginPage.open();
  await loginPage.loginSuccessfully();
  await pimPage.openEmployeeList();
  await expect(pimPage.employeeRows.first()).toBeVisible();

  await pimPage.searchByEmployeeId(`missing-${Date.now()}`);
  await pimPage.expectNoEmployeesFound();

  await pimPage.resetSearch();
  await expect(pimPage.employeeRows.first()).toBeVisible();
});

test('employee list remains usable and reports an API failure gracefully', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  const pimPage = new PimPage(page);

  await loginPage.open();
  await loginPage.loginSuccessfully();

  let interceptedRequests = 0;
  await page.route('**/api/v2/pim/employees**', async (route) => {
    if (route.request().method() === 'GET') {
      interceptedRequests += 1;
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Service temporarily unavailable' }),
      });
      return;
    }
    await route.continue();
  });

  await pimPage.openEmployeeList();
  await expect(page.locator('.oxd-toast')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Employee Information' }))
    .toBeVisible();
  expect(interceptedRequests).toBeGreaterThan(0);
});
