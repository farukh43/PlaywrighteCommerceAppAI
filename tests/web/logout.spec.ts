import { test, expect } from "@fixtures/pageFixtures";
import { Helper } from "@utils/helper";

test.describe("Customer Logout", () => {
  test("should log out and remove authenticated options", { tag: ["@master", "@regression", "@web"] }, async ({
    page,
    homePage,
    loginPage,
    myAccountPage,
    logoutPage,
  }) => {
    const { email, password } = Helper.getLoginDetails();

    await test.step("1) Log in with valid credentials", async () => {
      await homePage.open();
      await homePage.goToLogin();
      await loginPage.login(email, password);
      await expect(myAccountPage.heading).toBeVisible();
    });

    await test.step("2) Log out and verify the confirmation page", async () => {
      await myAccountPage.logout();
      await expect(logoutPage.heading).toBeVisible();
    });

    await test.step("3) Continue and verify the redirect to the home page", async () => {
      await logoutPage.continue();
      await expect(page).toHaveURL(/route=common\/home/);
    });

    await test.step("4) Verify authenticated account options are gone", async () => {
      await homePage.openMyAccountMenu();
      await expect(homePage.accountOption("Login")).toBeVisible();
      await expect(homePage.accountOption("Register")).toBeVisible();
      await expect(homePage.accountOption("Logout")).toHaveCount(0);
    });

    console.log("✅ Logout completed successfully");
  });
});
