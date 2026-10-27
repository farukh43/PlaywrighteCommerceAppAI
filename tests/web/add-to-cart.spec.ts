import { test, expect } from "@fixtures/pageFixtures";
import { Helper } from "@utils/helper";

test.describe("Add Product to Cart", () => {
  test("should add a product to the cart with the requested quantity", { tag: ["@master", "@regression", "@web"] }, async ({
    page,
    homePage,
    searchResultsPage,
    productPage,
    cartPage,
  }) => {
    const { productName, productQuantity } = Helper.getProductDetails();

    await test.step("1) Search for the product and open its details page", async () => {
      await homePage.open();
      await homePage.searchProduct(productName);
      await searchResultsPage.openProduct(productName);
    });

    await test.step("2) Verify the product details", async () => {
      await expect(productPage.productName).toHaveText(productName);
      await expect(productPage.price).toBeVisible();
      await expect(productPage.addToCartButton).toBeVisible();
    });

    await test.step("3) Set the quantity and add to cart", async () => {
      await productPage.setQuantity(productQuantity);
      await productPage.addToCart();
      await expect(productPage.successAlert).toContainText(
        `Success: You have added ${productName} to your shopping cart!`,
      );
    });

    await test.step("4) Verify the product and quantity in the cart", async () => {
      await productPage.openCart();
      await expect(page).toHaveURL(/route=checkout\/cart/);
      await expect(cartPage.productNameCell(productName)).toBeVisible();
      await expect(cartPage.quantityInput(productName)).toHaveValue(productQuantity);
    });

    console.log(`✅ Added ${productQuantity} x "${productName}" to the cart successfully`);
  });
});
