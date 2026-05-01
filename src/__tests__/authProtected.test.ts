import request from "supertest";
import app from "../app";
import prisma from "../config/prisma";
import { clearDatabase } from "../test-utils/clearDatabase";
import { createTestUser } from "../test-utils/createTestUser";

describe("Protected Routes", () => {

    afterEach(async () => {
        await clearDatabase();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it("should deny access without token", async () => {
        const res = await request(app)
            .get("/api/resumes");

        expect(res.statusCode).toBe(401);
    });

    it("should deny access with invalid token", async () => {
        const res = await request(app)
            .get("/api/resumes")
            .set("Cookie", ["token=invalid-token"]);

        expect(res.statusCode).toBe(401);
    });

    it("should allow access with valid token", async () => {
        const user = await createTestUser();
        const loginRes = await request(app)
            .post("/api/auth/login")
            .send({
                email: user.email,
                password: user.password
            });
        const cookies = loginRes.headers["set-cookie"];
        const res = await request(app)
            .get("/api/resumes")
            .set("Cookie", cookies);

        expect(res.statusCode).not.toBe(401);
    });

});
