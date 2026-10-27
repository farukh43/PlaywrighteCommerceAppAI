import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class SearchResultsPage extends BasePage {
  readonly heading: Locator;
  readonly productNames: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.locator("#content h1");
    this.productNames = page.locator(".product-thumb h4 a");
  }

  // Exact match so "MacBook" does not also select "MacBook Air" / "MacBook Pro"
  productLink(productName: string): Locator {
    return this.productNames.getByText(productName, { exact: true });
  }

  async openProduct(productName: string) {
    await this.productLink(productName).click();
  }
}
