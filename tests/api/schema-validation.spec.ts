import path from "path";
import { test, expect } from "@playwright/test";
import Ajv from "ajv";
import { DataProvider } from "@utils/DataReader";
import { Routes } from "@api/endpoints/routes";
import dotenv from "dotenv";

dotenv.config();

test.describe("Schema Validation API Tests", () => {
  // ---------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------

  const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
  const PRODUCT_ID = Number(process.env.PRODUCT_ID ?? 1);
  const USER_ID = Number(process.env.USER_ID ?? 1);
  const CART_ID = Number(process.env.CART_ID ?? 1);
  const SCHEMA_DIR = path.join(__dirname, "../../api/schemas");

  const ajv = new Ajv({ allErrors: true });

  // Validate a response body against a stored schema, failing with AJV's error details
  function expectMatchesSchema(body: unknown, schemaFile: string) {
    const schema = DataProvider.readJson(path.join(SCHEMA_DIR, schemaFile));
    const validate = ajv.compile(schema);
    const isValid = validate(body);

    if (!isValid) {
      console.log(`❌ Schema validation errors (${schemaFile}):`, JSON.stringify(validate.errors, null, 2));
    }

    expect(isValid, `Response should match ${schemaFile}: ${ajv.errorsText(validate.errors)}`).toBeTruthy();
  }

  // ---------------------------------------------------------
  // GET - Product Schema
  // ---------------------------------------------------------

  test("GET - Product Response Schema", { tag: ["@master", "@regression", "@api"] }, async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_PRODUCT_BY_ID.replace("{id}", String(PRODUCT_ID))}`);

    expect(response.status(), "Get product should return 200").toBe(200);

    expectMatchesSchema(await response.json(), "product_api_schema.json");

    console.log("✅ Product response matches product_api_schema.json");
  });

  // ---------------------------------------------------------
  // GET - User Schema
  // ---------------------------------------------------------

  test("GET - User Response Schema", { tag: ["@master", "@regression", "@api"] }, async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_USER_BY_ID.replace("{id}", String(USER_ID))}`);

    expect(response.status(), "Get user should return 200").toBe(200);

    expectMatchesSchema(await response.json(), "user_api_schema.json");

    console.log("✅ User response matches user_api_schema.json");
  });

  // ---------------------------------------------------------
  // GET - Cart Schema
  // ---------------------------------------------------------

  test("GET - Cart Response Schema", { tag: ["@master", "@regression", "@api"] }, async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_CART_BY_ID.replace("{id}", String(CART_ID))}`);

    expect(response.status(), "Get cart should return 200").toBe(200);

    expectMatchesSchema(await response.json(), "cart_api_schema.json");

    console.log("✅ Cart response matches cart_api_schema.json");
  });
});
