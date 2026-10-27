import { test, expect } from "@fixtures/pageFixtures";

test.describe("User Registration", () => {
  test("should register a new customer successfully", { tag: ["@master", "@sanity", "@regression", "@web"] }, async ({
    page,
    homePage,
    registerPage,
    myAccountPage,
    newCustomer,
  }) => {
    await test.step("1) Navigate to My Account → Register", async () => {
      await homePage.open();
      await homePage.goToRegister();
      await expect(registerPage.heading).toBeVisible();
    });

    await test.step("2) Fill and submit the registration form", async () => {
      await registerPage.register(newCustomer);
    });

    await test.step("3) Verify the account was created", async () => {
      await expect(page).toHaveURL(/route=account\/success/);
      await expect(registerPage.confirmationHeading).toHaveText("Your Account Has Been Created!");
    });

    await test.step("4) Verify the new account is available through account navigation", async () => {
      // The new account is signed in: account menu offers authenticated options
      await registerPage.openMyAccountMenu();
      await expect(registerPage.accountOption("Logout")).toBeVisible();
      await expect(registerPage.accountOption("Login")).toHaveCount(0);

      await registerPage.continueToAccount();
      await expect(page).toHaveURL(/route=account\/account/);
      await expect(myAccountPage.heading).toBeVisible();
    });

    console.log(`✅ Registration completed successfully for ${newCustomer.email}`);
  });
});
