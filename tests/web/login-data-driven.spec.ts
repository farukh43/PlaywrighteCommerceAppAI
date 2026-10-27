import path from "path";
import { test, expect } from "@fixtures/pageFixtures";
import { DataProvider } from "@utils/DataReader";

type LoginRow = {
  testName?: string;
  TestName?: string;
  email: string;
  password: string;
  expected: string;
};

// Switch to readJson("...opencart_logindata.json") to drive the same tests from JSON
const loginData: LoginRow[] = DataProvider.readCsv(
  path.join(__dirname, "../../testdata/opencart_logindata.csv"),
);

// OpenCart locks an email after 5 failed attempts within an hour, so fixed failure rows
// may get the lockout warning instead of "No match" on repeated runs
const LOGIN_FAILURE_WARNING =
  /Warning: (No match for E-Mail Address and\/or Password\.|Your account has exceeded allowed number of login attempts)/;

test.describe("Login - Data Driven", () => {
  for (const row of loginData) {
    const name = row.testName ?? row.TestName;
    const email = (row.email ?? "").trim();
    const password = (row.password ?? "").trim();
    const expected = (row.expected ?? "").trim().toLowerCase();

    test(name, { tag: ["@master", "@datadriven", "@web"] }, async ({ page, homePage, loginPage, myAccountPage }) => {
      await test.step("1) Open the login page", async () => {
        await homePage.open();
        await homePage.goToLogin();
        await expect(loginPage.heading).toBeVisible();
      });

      await test.step("2) Enter the row's credentials and submit", async () => {
        // Blank values stay blank so the application's own validation is exercised
        if (email) await loginPage.setEmail(email);
        if (password) await loginPage.setPassword(password);
        await loginPage.submit();
      });

      await test.step(`3) Verify the expected result: ${expected}`, async () => {
        if (expected === "success") {
          await expect(page).toHaveURL(/route=account\/account/);
          await expect(myAccountPage.heading).toBeVisible();
        } else {
          await expect(loginPage.warningAlert).toContainText(LOGIN_FAILURE_WARNING);
          await expect(page).toHaveURL(/route=account\/login/);
          await expect(myAccountPage.heading).toHaveCount(0);
        }
      });

      console.log(`✅ ${name}: login result matched expected "${expected}"`);
    });
  }
});
