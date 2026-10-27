import { test, expect } from "@fixtures/pageFixtures";
import { Helper } from "@utils/helper";
import { RandomDataUtil } from "@utils/dataGenerator";

test.describe("Customer Login", () => {
  test.beforeEach(async ({ homePage, loginPage }) => {
    await test.step("Navigate to My Account → Login", async () => {
      await homePage.open();
      await homePage.goToLogin();
      await expect(loginPage.heading).toBeVisible();
    });
  });

  test("should log in with valid credentials", { tag: ["@master", "@sanity", "@regression", "@web"] }, async ({
    page,
    loginPage,
    myAccountPage,
  }) => {
    const { email, password } = Helper.getLoginDetails();

    await test.step("1) Submit valid credentials", async () => {
      await loginPage.login(email, password);
    });

    await test.step("2) Verify redirect to the My Account dashboard", async () => {
      await expect(page).toHaveURL(/route=account\/account/);
      await expect(myAccountPage.heading).toBeVisible();
      await expect(myAccountPage.editAccountLink).toBeVisible();
    });

    await test.step("3) Verify authenticated account navigation", async () => {
      await myAccountPage.openMyAccountMenu();
      await expect(myAccountPage.accountOption("Logout")).toBeVisible();
    });

    console.log("✅ Valid login completed successfully");
  });

  test("should reject invalid credentials", { tag: ["@master", "@regression", "@web"] }, async ({ page, loginPage }) => {
    await test.step("1) Submit invalid credentials", async () => {
      // Unregistered random email, so repeated runs never trigger the lockout on a real account
      await loginPage.login(RandomDataUtil.getEmail(), RandomDataUtil.getPassword());
    });

    await test.step("2) Verify the warning message", async () => {
      await expect(loginPage.warningAlert).toContainText("Warning: No match for E-Mail Address and/or Password.");
      await expect(page).toHaveURL(/route=account\/login/);
    });

    await test.step("3) Verify the customer is not authenticated", async () => {
      await loginPage.openMyAccountMenu();
      await expect(loginPage.accountOption("Login")).toBeVisible();
      await expect(loginPage.accountOption("Logout")).toHaveCount(0);
    });

    console.log("✅ Invalid login rejected as expected");
  });
});
