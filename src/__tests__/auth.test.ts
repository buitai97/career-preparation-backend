import request from "supertest";
import app from "../app";
import prisma from "../config/prisma";
import { clearDatabase } from "../test-utils/clearDatabase";
import { createTestUser } from "../test-utils/createTestUser";


describe("Auth Routes", () => {
    afterEach(async () => {
        await clearDatabase();
    });
    afterAll(async () => {
        await prisma.$disconnect();
    });
    it("should register a user", async () => {
        const email = `test-${Date.now()}@example.com`;
        const password = "123456";
        const name = "Test User";

        const res = await request(app)
            .post("/api/auth/register")
            .send({ name, email, password });

        expect(res.statusCode).toBe(201);
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
        const res = await createTestUser();
        const loginRes = await request(app)
            .post("/api/auth/login")
            .send({
                email: res.email,
                password: res.password //
            });
        expect(loginRes.statusCode).toBe(200);
        expect(loginRes.body.user.email).toBe(res.email);
        expect(loginRes.body.user.name).toBe(res.name);
        expect(loginRes.body.user.password).toBeUndefined();
        expect(loginRes.body.user.id).toBeDefined();
    });
});