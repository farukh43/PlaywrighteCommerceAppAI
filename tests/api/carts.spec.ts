import { test, expect } from "@playwright/test";
import { RandomDataUtil } from "@utils/dataGenerator";
import { Routes } from "@api/endpoints/routes";
import dotenv from "dotenv";

dotenv.config();

test.describe("Carts API Tests", () => {
  // ---------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------

  const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
  const CART_ID = Number(process.env.CART_ID ?? 1);
  const USER_ID = Number(process.env.USER_ID ?? 1);
  const LIMIT = Number(process.env.LIMIT ?? 3);
  const START_DATE = process.env.START_DATE ?? "2019-12-10";
  const END_DATE = process.env.END_DATE ?? "2020-10-10";

  // ---------------------------------------------------------
  // GET - All Carts
  // ---------------------------------------------------------

  test("GET - All Carts", { tag: ["@master", "@sanity", "@api"] }, async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CARTS}`);

    expect(response.status(), "Get all carts should return 200").toBe(200);

    const carts = await response.json();

    expect(Array.isArray(carts), "Response should be an array").toBeTruthy();
    expect(carts.length, "Cart list should not be empty").toBeGreaterThan(0);
    carts.forEach((cart: any) => {
      expect(typeof cart.id, "Each cart should have a numeric id").toBe("number");
      expect(Array.isArray(cart.products), "Each cart should have a products array").toBeTruthy();
    });

    console.log(`✅ Retrieved ${carts.length} carts`);
  });

  // ---------------------------------------------------------
  // GET - Cart by ID
  // ---------------------------------------------------------

  test("GET - Cart by ID", { tag: ["@master", "@sanity", "@api"] }, async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_CART_BY_ID.replace("{id}", String(CART_ID))}`);

    expect(response.status(), "Get cart by ID should return 200").toBe(200);

    const cart = await response.json();

    expect(cart.id, "Returned ID should match the requested ID").toBe(CART_ID);
    expect(Array.isArray(cart.products), "Cart should have a products array").toBeTruthy();

    console.log(`✅ Retrieved cart ${CART_ID}`);
  });

  // ---------------------------------------------------------
  // GET - Carts by Date Range
  // ---------------------------------------------------------

  test("GET - Carts by Date Range", { tag: ["@master", "@regression", "@api"] }, async ({ request }) => {
    const url = Routes.GET_CARTS_BY_DATE_RANGE.replace("{startdate}", START_DATE).replace("{enddate}", END_DATE);

    const response = await request.get(`${BASE_URL}${url}`);

    expect(response.status(), "Get carts by date range should return 200").toBe(200);

    const carts = await response.json();

    expect(Array.isArray(carts), "Response should be an array").toBeTruthy();
    expect(carts.length, "Date range should return carts").toBeGreaterThan(0);

    // Cart dates are ISO timestamps; the end date is inclusive for the whole day
    const start = new Date(`${START_DATE}T00:00:00.000Z`).getTime();
    const end = new Date(`${END_DATE}T23:59:59.999Z`).getTime();
    carts.forEach((cart: any) => {
      const cartDate = new Date(cart.date).getTime();
      expect(cartDate, `Cart ${cart.id} date ${cart.date} should be on/after ${START_DATE}`).toBeGreaterThanOrEqual(start);
      expect(cartDate, `Cart ${cart.id} date ${cart.date} should be on/before ${END_DATE}`).toBeLessThanOrEqual(end);
    });

    console.log(`✅ ${carts.length} carts fall within ${START_DATE} – ${END_DATE}`);
  });

  // ---------------------------------------------------------
  // GET - User Cart
  // ---------------------------------------------------------

  test("GET - User Carts", { tag: ["@master", "@regression", "@api"] }, async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_USER_CART.replace("{userId}", String(USER_ID))}`);

    expect(response.status(), "Get user carts should return 200").toBe(200);

    const carts = await response.json();

    expect(Array.isArray(carts), "Response should be an array").toBeTruthy();
    expect(carts.length, `User ${USER_ID} should have carts`).toBeGreaterThan(0);
    carts.forEach((cart: any) => {
      expect(cart.userId, `Cart ${cart.id} should belong to user ${USER_ID}`).toBe(USER_ID);
    });

    console.log(`✅ All ${carts.length} carts belong to user ${USER_ID}`);
  });

  // ---------------------------------------------------------
  // GET - Carts with Limit
  // ---------------------------------------------------------

  test("GET - Carts with Limit", { tag: ["@master", "@regression", "@api"] }, async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_CARTS_WITH_LIMIT.replace("{limit}", String(LIMIT))}`);

    expect(response.status(), "Get carts with limit should return 200").toBe(200);

    const carts = await response.json();

    expect(Array.isArray(carts), "Response should be an array").toBeTruthy();
    expect(carts.length, "Cart count should match the limit").toBe(LIMIT);

    console.log(`✅ Limit ${LIMIT} returned ${carts.length} carts`);
  });

  // ---------------------------------------------------------
  // GET - Carts Sorted (Ascending / Descending)
  // ---------------------------------------------------------

  for (const order of ["asc", "desc"] as const) {
    test(`GET - Carts Sorted ${order === "asc" ? "Ascending" : "Descending"}`, { tag: ["@master", "@regression", "@api"] }, async ({ request }) => {
      const response = await request.get(`${BASE_URL}${Routes.GET_CARTS_SORTED.replace("{order}", order)}`);

      expect(response.status(), "Get sorted carts should return 200").toBe(200);

      const ids: number[] = (await response.json()).map((cart: any) => cart.id);
      const expectedIds = [...ids].sort((a, b) => (order === "asc" ? a - b : b - a));

      expect(ids.length, "Sorted list should not be empty").toBeGreaterThan(0);
      expect(ids, `Cart IDs should be in ${order} order`).toEqual(expectedIds);

      console.log(`✅ Carts are sorted in ${order} order`);
    });
  }

  // ---------------------------------------------------------
  // POST - Create Cart
  // ---------------------------------------------------------

  test("POST - Create Cart", { tag: ["@master", "@regression", "@api"] }, async ({ request }) => {
    const payload = RandomDataUtil.generateCartPayload(USER_ID);

    const response = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, { data: payload });

    expect(response.status(), "Create cart should return 201").toBe(201);

    const created = await response.json();

    expect(typeof created.id, "A cart ID should be returned").toBe("number");
    expect(created.userId, "Cart should belong to the submitted user").toBe(USER_ID);
    expect(created.products, "Cart should contain the submitted products").toEqual(payload.products);

    console.log(`✅ Created cart with ID ${created.id}`);
  });

  // ---------------------------------------------------------
  // PUT - Update Cart
  // ---------------------------------------------------------

  test("PUT - Update Cart", { tag: ["@master", "@regression", "@api"] }, async ({ request }) => {
    const payload = RandomDataUtil.generateCartPayload(USER_ID);
    // Change the quantity so the update is guaranteed to differ from the original
    payload.products[0].quantity += 1;

    const response = await request.put(`${BASE_URL}${Routes.UPDATE_CART.replace("{id}", String(CART_ID))}`, {
      data: payload,
    });

    expect(response.status(), "Update cart should return 200").toBe(200);

    const updated = await response.json();

    expect(updated.id, "Returned ID should match the requested ID").toBe(CART_ID);
    expect(updated.products[0].quantity, "Quantity should reflect the update").toBe(payload.products[0].quantity);
    expect(updated.products, "Products should reflect the update").toEqual(payload.products);

    console.log(`✅ Updated cart ${CART_ID} quantity to ${updated.products[0].quantity}`);
  });

  // ---------------------------------------------------------
  // DELETE - Delete Cart
  // ---------------------------------------------------------

  test("DELETE - Delete Cart", { tag: ["@master", "@regression", "@api"] }, async ({ request }) => {
    const response = await request.delete(`${BASE_URL}${Routes.DELETE_CART.replace("{id}", String(CART_ID))}`);

    expect(response.status(), "Delete cart should return 200").toBe(200);

    // The API returns the deleted cart record
    const deleted = await response.json();

    expect(deleted.id, "Deleted cart ID should match the requested ID").toBe(CART_ID);

    console.log(`✅ Deleted cart ${CART_ID}`);
  });
});
