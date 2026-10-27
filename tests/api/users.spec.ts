import { test, expect } from "@playwright/test";
import { RandomDataUtil } from "@utils/dataGenerator";
import { Routes } from "@api/endpoints/routes";
import dotenv from "dotenv";

dotenv.config();

test.describe("Users API Tests", () => {
  // ---------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------

  const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
  const USER_ID = Number(process.env.USER_ID ?? 1);
  const LIMIT = Number(process.env.LIMIT ?? 3);

  // ---------------------------------------------------------
  // GET - All Users
  // ---------------------------------------------------------

  test("GET - All Users", { tag: ["@master", "@sanity", "@api"] }, async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_USERS}`);

    expect(response.status(), "Get all users should return 200").toBe(200);

    const users = await response.json();

    expect(Array.isArray(users), "Response should be an array").toBeTruthy();
    expect(users.length, "User list should not be empty").toBeGreaterThan(0);
    users.forEach((user: any) => {
      expect(typeof user.id, "Each user should have a numeric id").toBe("number");
      expect(typeof user.username, "Each user should have a username").toBe("string");
    });

    console.log(`✅ Retrieved ${users.length} users`);
  });

  // ---------------------------------------------------------
  // GET - User by ID
  // ---------------------------------------------------------

  test("GET - User by ID", { tag: ["@master", "@sanity", "@api"] }, async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_USER_BY_ID.replace("{id}", String(USER_ID))}`);

    expect(response.status(), "Get user by ID should return 200").toBe(200);

    const user = await response.json();

    expect(user.id, "Returned ID should match the requested ID").toBe(USER_ID);
    expect(user.email, "User should have an email").toContain("@");

    console.log(`✅ Retrieved user ${USER_ID}: ${user.username}`);
  });

  // ---------------------------------------------------------
  // GET - Users with Limit
  // ---------------------------------------------------------

  test("GET - Users with Limit", { tag: ["@master", "@regression", "@api"] }, async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_USERS_WITH_LIMIT.replace("{limit}", String(LIMIT))}`);

    expect(response.status(), "Get users with limit should return 200").toBe(200);

    const users = await response.json();

    expect(Array.isArray(users), "Response should be an array").toBeTruthy();
    expect(users.length, "User count should match the limit").toBe(LIMIT);

    console.log(`✅ Limit ${LIMIT} returned ${users.length} users`);
  });

  // ---------------------------------------------------------
  // GET - Users Sorted (Ascending / Descending)
  // ---------------------------------------------------------

  for (const order of ["asc", "desc"] as const) {
    test(`GET - Users Sorted ${order === "asc" ? "Ascending" : "Descending"}`, { tag: ["@master", "@regression", "@api"] }, async ({ request }) => {
      const response = await request.get(`${BASE_URL}${Routes.GET_USERS_SORTED.replace("{order}", order)}`);

      expect(response.status(), "Get sorted users should return 200").toBe(200);

      const ids: number[] = (await response.json()).map((user: any) => user.id);
      const expectedIds = [...ids].sort((a, b) => (order === "asc" ? a - b : b - a));

      expect(ids.length, "Sorted list should not be empty").toBeGreaterThan(0);
      expect(ids, `User IDs should be in ${order} order`).toEqual(expectedIds);

      console.log(`✅ Users are sorted in ${order} order`);
    });
  }

  // ---------------------------------------------------------
  // POST - Create User
  // ---------------------------------------------------------

  test("POST - Create User", { tag: ["@master", "@regression", "@api"] }, async ({ request }) => {
    const payload = RandomDataUtil.generateUserPayload();

    const response = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, { data: payload });

    expect(response.status(), "Create user should return 201").toBe(201);

    // The API contract returns only the generated ID for a new user
    const created = await response.json();

    expect(typeof created.id, "A user ID should be returned").toBe("number");
    expect(created.id, "User ID should be positive").toBeGreaterThan(0);

    console.log(`✅ Created user with ID ${created.id}`);
  });

  // ---------------------------------------------------------
  // PUT - Update User
  // ---------------------------------------------------------

  test("PUT - Update User", { tag: ["@master", "@regression", "@api"] }, async ({ request }) => {
    const payload = RandomDataUtil.generateUserUpdatePayload();

    const response = await request.put(`${BASE_URL}${Routes.UPDATE_USER.replace("{id}", String(USER_ID))}`, {
      data: payload,
    });

    expect(response.status(), "Update user should return 200").toBe(200);

    const updated = await response.json();

    expect(updated, "Response should contain the updated values").toMatchObject(payload);

    console.log(`✅ Updated user ${USER_ID}`);
  });

  // ---------------------------------------------------------
  // DELETE - Delete User
  // ---------------------------------------------------------

  test("DELETE - Delete User", { tag: ["@master", "@regression", "@api"] }, async ({ request }) => {
    const response = await request.delete(`${BASE_URL}${Routes.DELETE_USER.replace("{id}", String(USER_ID))}`);

    expect(response.status(), "Delete user should return 200").toBe(200);

    // The API returns the deleted user record
    const deleted = await response.json();

    expect(deleted.id, "Deleted user ID should match the requested ID").toBe(USER_ID);

    console.log(`✅ Deleted user ${USER_ID}`);
  });
});
