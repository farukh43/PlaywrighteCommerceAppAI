import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ProductPage extends BasePage {
  readonly productName: Locator;
  readonly price: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;
  readonly successAlert: Locator;

  constructor(page: Page) {
    super(page);
    this.productName = page.locator("#content h1");
    // First <h2> in the price list is the tax-inclusive price, e.g. "$602.00"
    this.price = page.locator("#content ul.list-unstyled h2").first();
    this.quantityInput = page.locator("#input-quantity");
    this.addToCartButton = page.locator("#button-cart");
    this.successAlert = page.locator(".alert-success");
  }

  async setQuantity(quantity: string) {
    await this.quantityInput.fill(quantity);
  }

  async addToCart() {
    await this.addToCartButton.click();
  }

  async getPrice(): Promise<string> {
    return (await this.price.innerText()).trim();
  }
}
