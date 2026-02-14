import request from "supertest";
import app from "../../app";
import prisma from "../../config/prisma";
import { clearDatabase } from "./helpers/clearDatabase";
import { createTestUser } from "./helpers/createTestUser";

afterEach(async () => {
    await clearDatabase();
});
afterAll(async () => {
    await prisma.$disconnect();
});
describe("Auth Routes", () => {
    it("should register a user", async () => {
        const email = `test-${Date.now()}@example.com`;
        const password = "123456";
        const name = "Test User";

        const res = await request(app)
            .post("/api/auth/register")
            .send({ name, email, password });

        expect(res.statusCode).toBe(201);
        expect(res.body.token).toBeDefined();
        expect(res.body.user.email).toBe(email);
    });

    it("should not allow invalid email", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test",
                email: "invalid-email",
                password: "123456",
            });

        expect(res.statusCode).toBe(400);
    });

    it("should login a user", async () => {
        const user = await createTestUser();
        const loginRes = await request(app)
            .post("/api/auth/login")
            .send({
                email: user.email,
                password: user.password,
            });

        expect(loginRes.statusCode).toBe(200);
        expect(loginRes.body.token).toBeDefined();
        expect(loginRes.body.user).toBeDefined();
        expect(loginRes.body.user.email).toBe(user.email);
        expect(loginRes.body.user.name).toBe(user.name);
        expect(loginRes.body.user.password).toBeUndefined();
        expect(loginRes.body.user.id).toBeDefined();
    });
});