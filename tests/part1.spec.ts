import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { PimPage } from '../pages/PimPage';

test('valid login, employee management navigation, and logout', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const pimPage = new PimPage(page);

  await loginPage.open();
  await loginPage.loginSuccessfully();
  await pimPage.openEmployeeList();
  await expect(pimPage.employeeRows.first()).toBeVisible();
  await pimPage.logout();
});

test('invalid credentials are rejected and protected content redirects to login', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);

  await loginPage.open();
  await loginPage.login('invalid-user', 'invalid-password');
  await loginPage.expectInvalidCredentials();
  await expect(page).toHaveURL(/login/);

  await page.goto('/web/index.php/pim/viewEmployeeList');
  await expect(page).toHaveURL(/login/);
  await expect(loginPage.loginButton).toBeVisible();
});

test('employee list renders data and expected columns', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const pimPage = new PimPage(page);

  await loginPage.open();
  await loginPage.loginSuccessfully();
  await pimPage.openEmployeeList();

  await expect(pimPage.employeeRows.first()).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'First (& Middle) Name' }))
    .toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Last Name' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: /^Id/ })).toBeVisible();
});
