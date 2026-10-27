import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class CartPage extends BasePage {
  readonly heading: Locator;
  readonly productRows: Locator;
  readonly cartTotal: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.locator("#content h1");
    this.productRows = page.locator("#content form table tbody tr");
    // Exact "Total:" label so the "Sub-Total:" row is not matched
    this.cartTotal = page
      .locator("#content")
      .getByRole("row")
      .filter({ has: page.getByText("Total:", { exact: true }) })
      .getByRole("cell")
      .last();
  }

  productRow(productName: string): Locator {
    return this.productRows.filter({
      has: this.page.locator("td.text-left > a").getByText(productName, { exact: true }),
    });
  }

  productNameCell(productName: string): Locator {
    return this.productRow(productName).locator("td.text-left > a");
  }

  quantityInput(productName: string): Locator {
    return this.productRow(productName).locator('input[name^="quantity"]');
  }

  // Columns: Image | Product Name | Model | Quantity | Unit Price | Total
  unitPrice(productName: string): Locator {
    return this.productRow(productName).locator("td").nth(4);
  }

  rowTotal(productName: string): Locator {
    return this.productRow(productName).locator("td").nth(5);
  }
}
