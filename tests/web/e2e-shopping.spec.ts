import { test, expect } from "@fixtures/pageFixtures";
import { Helper } from "@utils/helper";

test.describe("End-to-End Shopping", () => {
  test("should register, re-login, search, add to cart and validate the cart", { tag: ["@master", "@e2e", "@web"] }, async ({
    page,
    homePage,
    registerPage,
    loginPage,
    myAccountPage,
    logoutPage,
    searchResultsPage,
    productPage,
    cartPage,
    newCustomer,
  }) => {
    test.setTimeout(90 * 1000);
    const { productName, productQuantity, totalPrice } = Helper.getProductDetails();

    await test.step("Register a new customer", async () => {
      await homePage.open();
      await homePage.goToRegister();
      await registerPage.register(newCustomer);
      await expect(registerPage.confirmationHeading).toHaveText("Your Account Has Been Created!");
    });

    await test.step("Log out", async () => {
      await registerPage.logout();
      await expect(logoutPage.heading).toBeVisible();
      await logoutPage.continue();
    });

    await test.step("Log in with the new credentials", async () => {
      await homePage.goToLogin();
      await loginPage.login(newCustomer.email, newCustomer.password);
      await expect(page).toHaveURL(/route=account\/account/);
      await expect(myAccountPage.heading).toBeVisible();
    });

    let productPrice = "";
    await test.step("Search and open the product", async () => {
      await myAccountPage.searchProduct(productName);
      await searchResultsPage.openProduct(productName);
      await expect(productPage.productName).toHaveText(productName);
      productPrice = await productPage.getPrice();
    });

    await test.step("Add the product to the cart", async () => {
      await productPage.setQuantity(productQuantity);
      await productPage.addToCart();
      await expect(productPage.successAlert).toContainText(
        `Success: You have added ${productName} to your shopping cart!`,
      );
    });

    await test.step("Validate the cart", async () => {
      await productPage.openCart();
      await expect(cartPage.productRows).toHaveCount(1);
      await expect(cartPage.productNameCell(productName)).toBeVisible();
      await expect(cartPage.quantityInput(productName)).toHaveValue(productQuantity);
      await expect(cartPage.unitPrice(productName)).toHaveText(productPrice);

      const expectedRowTotal = Helper.convertPriceToNumber(productPrice) * Number(productQuantity);
      expect(Helper.convertPriceToNumber(await cartPage.rowTotal(productName).innerText())).toBe(expectedRowTotal);

      const cartTotal = Helper.convertPriceToNumber(await cartPage.cartTotal.innerText());
      expect(cartTotal).toBe(expectedRowTotal);
      expect(cartTotal).toBe(Helper.convertPriceToNumber(totalPrice));
    });

    console.log(`✅ End-to-end shopping journey completed successfully for ${newCustomer.email}`);
  });
});
