import { Router } from "express";
import { register, login, logout, getCurrentUser, updateCurrentUser } from "./auth.controller";
import { validate } from "../../middleware/validate.middleware";
import { AuthSchemas } from "./auth.schema";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.post("/register", validate(AuthSchemas.register), register);
router.post("/login", validate(AuthSchemas.login), login);
router.post("/logout", logout);
router.get("/me", authMiddleware, getCurrentUser);
router.put("/me", authMiddleware, validate(AuthSchemas.updateCurrentUser), updateCurrentUser);

export default router;
