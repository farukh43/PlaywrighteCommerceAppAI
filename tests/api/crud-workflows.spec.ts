import { test, expect, APIResponse } from "@playwright/test";
import { RandomDataUtil } from "@utils/dataGenerator";
import { Routes } from "@api/endpoints/routes";
import dotenv from "dotenv";

dotenv.config();

test.describe("CRUD Workflow API Tests", () => {
  // ---------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------

  const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
  const USER_ID = Number(process.env.USER_ID ?? 1);

  // FakeStore does not persist created records, so deleting one may return an empty/null body.
  // When a body is returned, it must describe the deleted ID.
  async function expectDeleteBody(response: APIResponse, id: number) {
    const text = (await response.text()).trim();
    if (text && text !== "null") {
      expect(JSON.parse(text).id, "Deleted record ID should match the requested ID").toBe(id);
    }
  }

  // ---------------------------------------------------------
  // Product CRUD Workflow
  // ---------------------------------------------------------

  test("Product CRUD Workflow - Create, Update, Delete", { tag: ["@master", "@e2e", "@api"] }, async ({ request }) => {
    let productId = 0;

    await test.step("1) Create a product", async () => {
      const payload = RandomDataUtil.generateProductPayload();
      const response = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, { data: payload });

      expect(response.status(), "Create product should return 201").toBe(201);

      const created = await response.json();
      expect(typeof created.id, "A product ID should be returned").toBe("number");
      expect(created, "Response should contain the submitted product data").toMatchObject(payload);
      productId = created.id;
    });

    await test.step("2) Update the same product", async () => {
      const payload = RandomDataUtil.generateUpdatedProductPayload();
      const response = await request.put(`${BASE_URL}${Routes.UPDATE_PRODUCT.replace("{id}", String(productId))}`, {
        data: payload,
      });

      expect(response.status(), "Update product should return 200").toBe(200);

      const updated = await response.json();
      expect(updated.id, "Updated product ID should match the created ID").toBe(productId);
      expect(updated, "Response should contain the updated values").toMatchObject(payload);
    });

    await test.step("3) Delete the same product", async () => {
      const response = await request.delete(`${BASE_URL}${Routes.DELETE_PRODUCT.replace("{id}", String(productId))}`);

      expect(response.status(), "Delete product should return 200").toBe(200);
      await expectDeleteBody(response, productId);
    });

    console.log(`✅ Product CRUD workflow completed for product ID ${productId}`);
  });

  // ---------------------------------------------------------
  // User CRUD Workflow
  // ---------------------------------------------------------

  test("User CRUD Workflow - Create, Update, Delete", { tag: ["@master", "@e2e", "@api"] }, async ({ request }) => {
    let userId = 0;

    await test.step("1) Create a user", async () => {
      const payload = RandomDataUtil.generateUserPayload();
      const response = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, { data: payload });

      expect(response.status(), "Create user should return 201").toBe(201);

      // The API contract returns only the generated ID for a new user
      const created = await response.json();
      expect(typeof created.id, "A user ID should be returned").toBe("number");
      userId = created.id;
    });

    await test.step("2) Update the same user", async () => {
      const payload = RandomDataUtil.generateUserUpdatePayload();
      const response = await request.put(`${BASE_URL}${Routes.UPDATE_USER.replace("{id}", String(userId))}`, {
        data: payload,
      });

      expect(response.status(), "Update user should return 200").toBe(200);

      const updated = await response.json();
      expect(updated, "Response should contain the updated user information").toMatchObject(payload);
    });

    await test.step("3) Delete the same user", async () => {
      const response = await request.delete(`${BASE_URL}${Routes.DELETE_USER.replace("{id}", String(userId))}`);

      expect(response.status(), "Delete user should return 200").toBe(200);
      await expectDeleteBody(response, userId);
    });

    console.log(`✅ User CRUD workflow completed for user ID ${userId}`);
  });

  // ---------------------------------------------------------
  // Cart CRUD Workflow
  // ---------------------------------------------------------

  test("Cart CRUD Workflow - Create, Update, Delete", { tag: ["@master", "@e2e", "@api"] }, async ({ request }) => {
    let cartId = 0;
    const payload = RandomDataUtil.generateCartPayload(USER_ID);

    await test.step("1) Create a cart", async () => {
      const response = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, { data: payload });

      expect(response.status(), "Create cart should return 201").toBe(201);

      const created = await response.json();
      expect(typeof created.id, "A cart ID should be returned").toBe("number");
      expect(created.userId, "Cart should belong to the submitted user").toBe(USER_ID);
      expect(created.products, "Cart should contain the submitted products").toEqual(payload.products);
      cartId = created.id;
    });

    await test.step("2) Update the same cart's product quantity", async () => {
      const updatedPayload = {
        ...payload,
        products: payload.products.map((product) => ({ ...product, quantity: product.quantity + 1 })),
      };
      const response = await request.put(`${BASE_URL}${Routes.UPDATE_CART.replace("{id}", String(cartId))}`, {
        data: updatedPayload,
      });

      expect(response.status(), "Update cart should return 200").toBe(200);

      const updated = await response.json();
      expect(updated.id, "Updated cart ID should match the created ID").toBe(cartId);
      expect(updated.products[0].quantity, "Quantity should reflect the update").toBe(payload.products[0].quantity + 1);
    });

    await test.step("3) Delete the same cart", async () => {
      const response = await request.delete(`${BASE_URL}${Routes.DELETE_CART.replace("{id}", String(cartId))}`);

      expect(response.status(), "Delete cart should return 200").toBe(200);
      await expectDeleteBody(response, cartId);
    });

    console.log(`✅ Cart CRUD workflow completed for cart ID ${cartId}`);
  });
});
