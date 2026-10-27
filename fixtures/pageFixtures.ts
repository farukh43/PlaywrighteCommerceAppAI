import { test as base, expect } from "@playwright/test";
import { BasePage } from "@pages/BasePage";
import { RegisterPage, CustomerDetails } from "@pages/RegisterPage";
import { LoginPage } from "@pages/LoginPage";
import { MyAccountPage } from "@pages/MyAccountPage";
import { LogoutPage } from "@pages/LogoutPage";
import { SearchResultsPage } from "@pages/SearchResultsPage";
import { ProductPage } from "@pages/ProductPage";
import { CartPage } from "@pages/CartPage";
import { RandomDataUtil } from "@utils/dataGenerator";

type PageFixtures = {
  homePage: BasePage;
  registerPage: RegisterPage;
  loginPage: LoginPage;
  myAccountPage: MyAccountPage;
  logoutPage: LogoutPage;
  searchResultsPage: SearchResultsPage;
  productPage: ProductPage;
  cartPage: CartPage;
  newCustomer: CustomerDetails;
};

export const test = base.extend<PageFixtures>({
  homePage: async ({ page }, use) => {
    await use(new BasePage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  myAccountPage: async ({ page }, use) => {
    await use(new MyAccountPage(page));
  },
  logoutPage: async ({ page }, use) => {
    await use(new LogoutPage(page));
  },
  searchResultsPage: async ({ page }, use) => {
    await use(new SearchResultsPage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  // Unique customer per test; the timestamp prefix keeps the email unique across repeated runs
  newCustomer: async ({}, use) => {
    await use({
      firstName: RandomDataUtil.getFirstName(),
      lastName: RandomDataUtil.getLastName(),
      email: `${Date.now()}_${RandomDataUtil.getEmail()}`.toLowerCase(),
      telephone: RandomDataUtil.getPhoneNumber(),
      password: RandomDataUtil.getPassword(),
    });
  },
});

export { expect };
