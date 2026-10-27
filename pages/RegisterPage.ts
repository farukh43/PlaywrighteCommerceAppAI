import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export interface CustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  password: string;
}

export class RegisterPage extends BasePage {
  readonly heading: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly telephoneInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly privacyPolicyCheckbox: Locator;
  readonly continueButton: Locator;
  readonly confirmationHeading: Locator;
  readonly confirmationContinueLink: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", { name: "Register Account" });
    this.firstNameInput = page.locator("#input-firstname");
    this.lastNameInput = page.locator("#input-lastname");
    this.emailInput = page.locator("#input-email");
    this.telephoneInput = page.locator("#input-telephone");
    this.passwordInput = page.locator("#input-password");
    this.confirmPasswordInput = page.locator("#input-confirm");
    this.privacyPolicyCheckbox = page.locator('input[name="agree"]');
    this.continueButton = page.getByRole("button", { name: "Continue" });
    this.confirmationHeading = page.locator("#content h1");
    this.confirmationContinueLink = page.locator("#content").getByRole("link", { name: "Continue" });
  }

  async fillRegistrationForm(customer: CustomerDetails) {
    await this.firstNameInput.fill(customer.firstName);
    await this.lastNameInput.fill(customer.lastName);
    await this.emailInput.fill(customer.email);
    await this.telephoneInput.fill(customer.telephone);
    await this.passwordInput.fill(customer.password);
    await this.confirmPasswordInput.fill(customer.password);
  }

  async acceptPrivacyPolicy() {
    await this.privacyPolicyCheckbox.check();
  }

  async submit() {
    await this.continueButton.click();
  }

  async register(customer: CustomerDetails) {
    await this.fillRegistrationForm(customer);
    await this.acceptPrivacyPolicy();
    await this.submit();
  }

  async continueToAccount() {
    await this.confirmationContinueLink.click();
  }
}
