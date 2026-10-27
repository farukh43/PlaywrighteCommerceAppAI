import { test, expect } from "@fixtures/pageFixtures";
import { Helper } from "@utils/helper";

test.describe("Product Search", () => {
  test("should find a known product by name", { tag: ["@master", "@sanity", "@regression", "@web"] }, async ({
    page,
    homePage,
    searchResultsPage,
  }) => {
    const { productName } = Helper.getProductDetails();

    await test.step("1) Search for a known product", async () => {
      await homePage.open();
      await expect(homePage.searchInput).toBeVisible();
      await homePage.searchProduct(productName);
    });

    await test.step("2) Verify the search results page", async () => {
      await expect(page).toHaveURL(/route=product\/search/);
      await expect(searchResultsPage.heading).toHaveText(`Search - ${productName}`);
    });

    await test.step("3) Verify the expected product is listed and results match the criteria", async () => {
      await expect(searchResultsPage.productLink(productName)).toBeVisible();

      // Every result must match the search criteria
      for (const name of await searchResultsPage.productNames.allInnerTexts()) {
        expect(name.toLowerCase()).toContain(productName.toLowerCase());
      }
    });

    console.log(`✅ Product search for "${productName}" completed successfully`);
  });
});
