import { expect, type Locator, type Page } from '@playwright/test';

export class PimPage {
  readonly employeeRows: Locator;

  constructor(private readonly page: Page) {
    this.employeeRows = page.locator('.oxd-table-body .oxd-table-card');
  }

  async openEmployeeList(): Promise<void> {
    await this.page.goto('/web/index.php/pim/viewEmployeeList');
    await expect(this.page).toHaveURL(/pim\/viewEmployeeList/);
    await expect(this.page.getByRole('heading', { name: 'Employee Information' }))
      .toBeVisible();
  }

  async searchByEmployeeId(employeeId: string): Promise<void> {
    const employeeIdInput = this.page
      .locator('.oxd-input-group')
      .filter({ hasText: 'Employee Id' })
      .getByRole('textbox');
    await employeeIdInput.fill(employeeId);

    const employeesResponse = this.page.waitForResponse(
      (response) =>
        response.url().includes('/api/v2/pim/employees') &&
        response.request().method() === 'GET',
    );
    await this.page.getByRole('button', { name: 'Search' }).click();
    await employeesResponse;
  }

  async resetSearch(): Promise<void> {
    const employeesResponse = this.page.waitForResponse(
      (response) =>
        response.url().includes('/api/v2/pim/employees') &&
        response.request().method() === 'GET',
    );
    await this.page.getByRole('button', { name: 'Reset' }).click();
    await employeesResponse;
  }

  async expectNoEmployeesFound(): Promise<void> {
    await expect(this.employeeRows).toHaveCount(0);
  }

  async logout(): Promise<void> {
    await this.page.getByRole('banner').getByRole('listitem').first().click();
    await this.page.getByText('Logout', { exact: true }).click();
    await expect(this.page).toHaveURL(/login/);
  }
}
