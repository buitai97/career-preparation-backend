import request from "supertest";
import app from "../../../app";

export async function createTestUser() {
  const email = `test-${Date.now()}@example.com`;
  const password = "123456";
  const name = `Test User ${Date.now()}`;

  const res = await request(app)
    .post("/api/auth/register")
    .send({ name, email, password });

  return {
    email,
    password,
    name,
    token: res.body.token,
    user: res.body.user,
  };
}