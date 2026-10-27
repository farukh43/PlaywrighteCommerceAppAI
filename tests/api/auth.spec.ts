import { test, expect } from "@playwright/test";
import { RandomDataUtil } from "@utils/dataGenerator";
import { Routes } from "@api/endpoints/routes";
import dotenv from "dotenv";

dotenv.config();

test.describe("Auth API Tests", () => {
  // ---------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------

  const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
  // API_ prefix avoids the OS USERNAME variable, which dotenv will not override
  const API_USERNAME = process.env.API_USERNAME ?? "";
  const API_PASSWORD = process.env.API_PASSWORD ?? "";

  // ---------------------------------------------------------
  // POST - Successful Login
  // ---------------------------------------------------------

  test("POST - Login with valid credentials", { tag: ["@master", "@sanity", "@api"] }, async ({ request }) => {
    const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
      data: { username: API_USERNAME, password: API_PASSWORD },
    });

    expect(response.status(), "Valid login should return 201").toBe(201);

    const responseBody = await response.json();

    expect(responseBody, "Response should contain a token").toHaveProperty("token");
    expect(typeof responseBody.token, "Token should be a string").toBe("string");
    expect(responseBody.token.length, "Token should not be empty").toBeGreaterThan(0);

    console.log("✅ Valid login returned an authentication token");
  });

  // ---------------------------------------------------------
  // POST - Invalid Login
  // ---------------------------------------------------------

  test("POST - Login with invalid credentials", { tag: ["@master", "@regression", "@api"] }, async ({ request }) => {
    const payload = RandomDataUtil.generateInvalidLoginPayload();

    const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, { data: payload });

    expect(response.status(), "Invalid login should return 401").toBe(401);

    // The API returns the error as plain text, not JSON
    const responseText = await response.text();

    expect(responseText, "Error message should match").toBe("username or password is incorrect");

    console.log("✅ Invalid login rejected with the expected error");
  });
});
