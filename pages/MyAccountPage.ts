import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class MyAccountPage extends BasePage {
  readonly heading: Locator;
  readonly editAccountLink: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.locator("#content").getByRole("heading", { name: "My Account", exact: true });
    this.editAccountLink = page.locator("#content").getByRole("link", { name: "Edit your account information" });
  }
}
