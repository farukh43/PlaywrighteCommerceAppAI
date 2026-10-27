import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly warningAlert: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", { name: "Returning Customer" });
    this.emailInput = page.locator("#input-email");
    this.passwordInput = page.locator("#input-password");
    this.loginButton = page.getByRole("button", { name: "Login" });
    this.warningAlert = page.locator(".alert-danger");
  }

  async setEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async setPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.loginButton.click();
  }

  async login(email: string, password: string) {
    await this.setEmail(email);
    await this.setPassword(password);
    await this.submit();
  }
}
