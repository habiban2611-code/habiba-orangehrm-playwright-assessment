import { expect, type Locator, type Page } from '@playwright/test';
import { environment } from '../config/environment';

export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;

  constructor(private readonly page: Page) {
    this.username = page.getByPlaceholder('Username');
    this.password = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }

  async open(): Promise<void> {
    await this.page.goto('/web/index.php/auth/login');
  }

  async login(
    username = environment.username,
    password = environment.password,
  ): Promise<void> {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }

  async loginSuccessfully(): Promise<void> {
    await this.login();
    await expect(this.page).toHaveURL(/dashboard/);
    await expect(this.page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  }

  async expectInvalidCredentials(): Promise<void> {
    await expect(
      this.page.getByRole('alert').getByText('Invalid credentials', { exact: true }),
    ).toBeVisible();
  }
}
