import { Page, Locator } from "@playwright/test";

// Shared header actions available on every OpenCart storefront page
export class BasePage {
  readonly page: Page;
  readonly myAccountMenu: Locator;
  readonly accountDropdown: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly shoppingCartLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.myAccountMenu = page.locator("#top-links").getByTitle("My Account");
    this.accountDropdown = page.locator("#top-links .dropdown-menu");
    this.searchInput = page.locator('#search input[name="search"]');
    this.searchButton = page.locator("#search button");
    this.shoppingCartLink = page.locator("#top-links").getByTitle("Shopping Cart");
  }

  // Open the home page (relative to baseURL from WEB_APP_URL)
  async open() {
    await this.page.goto("./");
  }

  async openMyAccountMenu() {
    await this.myAccountMenu.click();
  }

  // Click an option under the "My Account" dropdown, e.g. Register, Login, Logout
  async selectAccountOption(option: string) {
    await this.openMyAccountMenu();
    await this.accountDropdown.getByRole("link", { name: option, exact: true }).click();
  }

  accountOption(option: string): Locator {
    return this.accountDropdown.getByRole("link", { name: option, exact: true });
  }

  async goToRegister() {
    await this.selectAccountOption("Register");
  }

  async goToLogin() {
    await this.selectAccountOption("Login");
  }

  async logout() {
    await this.selectAccountOption("Logout");
  }

  async searchProduct(productName: string) {
    await this.searchInput.fill(productName);
    await this.searchButton.click();
  }

  async openCart() {
    await this.shoppingCartLink.click();
  }
}
