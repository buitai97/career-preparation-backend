import { Router } from "express";
import { register, login, logout, getCurrentUser, updateCurrentUser } from "./auth.controller";
import { validate } from "../../middleware/validate.middleware";
import { AuthSchemas } from "./auth.schema";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully
 */
router.post("/register", validate(AuthSchemas.createUser), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login an existing user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 */
router.post("/login", validate(AuthSchemas.loginUser), login);
router.post("/logout", logout);
router.get("/me", authMiddleware, getCurrentUser);
router.put("/me", authMiddleware, validate(AuthSchemas.updateCurrentUser), updateCurrentUser);
export default router;
