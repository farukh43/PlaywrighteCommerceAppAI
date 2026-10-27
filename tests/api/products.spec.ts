import { test, expect } from "@playwright/test";
import { RandomDataUtil } from "@utils/dataGenerator";
import { Routes } from "@api/endpoints/routes";
import dotenv from "dotenv";

dotenv.config();

test.describe("Products API Tests", () => {
  // ---------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------

  const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
  const PRODUCT_ID = Number(process.env.PRODUCT_ID ?? 1);
  const LIMIT = Number(process.env.LIMIT ?? 3);
  const CATEGORY = "electronics";

  // Shared check for the important fields of a single product
  function expectValidProduct(product: any) {
    expect(typeof product.id, "id should be a number").toBe("number");
    expect(typeof product.title, "title should be a string").toBe("string");
    expect(product.title.length, "title should not be empty").toBeGreaterThan(0);
    expect(typeof product.price, "price should be a number").toBe("number");
    expect(product.price, "price should be positive").toBeGreaterThan(0);
    expect(typeof product.category, "category should be a string").toBe("string");
    expect(product.image, "image should be a URL").toMatch(/^https?:\/\//);
  }

  // ---------------------------------------------------------
  // GET - All Products
  // ---------------------------------------------------------

  test("GET - All Products", { tag: ["@master", "@sanity", "@api"] }, async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_PRODUCTS}`);

    expect(response.status(), "Get all products should return 200").toBe(200);

    const products = await response.json();

    expect(Array.isArray(products), "Response should be an array").toBeTruthy();
    expect(products.length, "Product list should not be empty").toBeGreaterThan(0);
    products.forEach((product: any) => expectValidProduct(product));

    console.log(`✅ Retrieved ${products.length} products`);
  });

  // ---------------------------------------------------------
  // GET - Product by ID
  // ---------------------------------------------------------

  test("GET - Product by ID", { tag: ["@master", "@sanity", "@api"] }, async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_PRODUCT_BY_ID.replace("{id}", String(PRODUCT_ID))}`);

    expect(response.status(), "Get product by ID should return 200").toBe(200);

    const product = await response.json();

    expect(product.id, "Returned ID should match the requested ID").toBe(PRODUCT_ID);
    expectValidProduct(product);

    console.log(`✅ Retrieved product ${PRODUCT_ID}: ${product.title}`);
  });

  // ---------------------------------------------------------
  // GET - Products with Limit
  // ---------------------------------------------------------

  test("GET - Products with Limit", { tag: ["@master", "@regression", "@api"] }, async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_PRODUCTS_WITH_LIMIT.replace("{limit}", String(LIMIT))}`);

    expect(response.status(), "Get products with limit should return 200").toBe(200);

    const products = await response.json();

    expect(Array.isArray(products), "Response should be an array").toBeTruthy();
    expect(products.length, "Product count should match the limit").toBe(LIMIT);

    console.log(`✅ Limit ${LIMIT} returned ${products.length} products`);
  });

  // ---------------------------------------------------------
  // GET - Products Sorted (Ascending / Descending)
  // ---------------------------------------------------------

  test("GET - Products Sorted Ascending", { tag: ["@master", "@regression", "@api"] }, async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_PRODUCTS_SORTED.replace("{order}", "asc")}`);

    expect(response.status(), "Get sorted products should return 200").toBe(200);

    const ids: number[] = (await response.json()).map((product: any) => product.id);
    const expectedIds = [...ids].sort((a, b) => a - b);

    expect(ids.length, "Sorted list should not be empty").toBeGreaterThan(0);
    expect(ids, "Product IDs should be in ascending order").toEqual(expectedIds);

    console.log("✅ Products are sorted in ascending order");
  });

  test("GET - Products Sorted Descending", { tag: ["@master", "@regression", "@api"] }, async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_PRODUCTS_SORTED.replace("{order}", "desc")}`);

    expect(response.status(), "Get sorted products should return 200").toBe(200);

    const ids: number[] = (await response.json()).map((product: any) => product.id);
    const expectedIds = [...ids].sort((a, b) => b - a);

    expect(ids.length, "Sorted list should not be empty").toBeGreaterThan(0);
    expect(ids, "Product IDs should be in descending order").toEqual(expectedIds);

    console.log("✅ Products are sorted in descending order");
  });

  // ---------------------------------------------------------
  // GET - All Categories
  // ---------------------------------------------------------

  test("GET - All Product Categories", { tag: ["@master", "@sanity", "@api"] }, async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CATEGORIES}`);

    expect(response.status(), "Get categories should return 200").toBe(200);

    const categories = await response.json();

    expect(Array.isArray(categories), "Response should be an array").toBeTruthy();
    expect(categories.length, "Category list should not be empty").toBeGreaterThan(0);
    categories.forEach((category: any) => {
      expect(typeof category, "Each category should be a string").toBe("string");
    });

    console.log(`✅ Retrieved categories: ${categories.join(", ")}`);
  });

  // ---------------------------------------------------------
  // GET - Products by Category
  // ---------------------------------------------------------

  test("GET - Products by Category", { tag: ["@master", "@regression", "@api"] }, async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_PRODUCTS_BY_CATEGORY.replace("{category}", CATEGORY)}`);

    expect(response.status(), "Get products by category should return 200").toBe(200);

    const products = await response.json();

    expect(Array.isArray(products), "Response should be an array").toBeTruthy();
    expect(products.length, `Category "${CATEGORY}" should contain products`).toBeGreaterThan(0);
    products.forEach((product: any) => {
      expect(product.category, `Product ${product.id} should belong to "${CATEGORY}"`).toBe(CATEGORY);
    });

    console.log(`✅ All ${products.length} products belong to "${CATEGORY}"`);
  });

  // ---------------------------------------------------------
  // POST - Create Product
  // ---------------------------------------------------------

  test("POST - Create Product", { tag: ["@master", "@regression", "@api"] }, async ({ request }) => {
    const payload = RandomDataUtil.generateProductPayload();

    const response = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, { data: payload });

    expect(response.status(), "Create product should return 201").toBe(201);

    const created = await response.json();

    expect(typeof created.id, "A product ID should be returned").toBe("number");
    expect(created, "Response should contain the submitted product data").toMatchObject(payload);

    console.log(`✅ Created product with ID ${created.id}`);
  });

  // ---------------------------------------------------------
  // PUT - Update Product
  // ---------------------------------------------------------

  test("PUT - Update Product", { tag: ["@master", "@regression", "@api"] }, async ({ request }) => {
    const payload = RandomDataUtil.generateUpdatedProductPayload();

    const response = await request.put(`${BASE_URL}${Routes.UPDATE_PRODUCT.replace("{id}", String(PRODUCT_ID))}`, {
      data: payload,
    });

    expect(response.status(), "Update product should return 200").toBe(200);

    const updated = await response.json();

    expect(updated.id, "Returned ID should match the requested ID").toBe(PRODUCT_ID);
    expect(updated, "Response should contain the updated values").toMatchObject(payload);

    console.log(`✅ Updated product ${PRODUCT_ID}`);
  });

  // ---------------------------------------------------------
  // DELETE - Delete Product
  // ---------------------------------------------------------

  test("DELETE - Delete Product", { tag: ["@master", "@regression", "@api"] }, async ({ request }) => {
    const response = await request.delete(`${BASE_URL}${Routes.DELETE_PRODUCT.replace("{id}", String(PRODUCT_ID))}`);

    expect(response.status(), "Delete product should return 200").toBe(200);

    // The API returns the deleted product record
    const deleted = await response.json();

    expect(deleted.id, "Deleted product ID should match the requested ID").toBe(PRODUCT_ID);

    console.log(`✅ Deleted product ${PRODUCT_ID}`);
  });
});
