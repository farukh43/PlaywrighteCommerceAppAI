import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class LogoutPage extends BasePage {
  readonly heading: Locator;
  readonly continueLink: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", { name: "Account Logout" });
    this.continueLink = page.locator("#content").getByRole("link", { name: "Continue" });
  }

  async continue() {
    await this.continueLink.click();
  }
}
