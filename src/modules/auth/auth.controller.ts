import { Response } from "express";
import { registerUser, loginUser, getUserById, updateUserById } from "./auth.service";
import { AuthRequest } from "../../types/express";
import { asyncHandler } from "../../utils/asyncHandler";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "token";
const cookieOptions = (req: AuthRequest) => ({
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    sameSite: "lax" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
});

const signToken = (userId: string) =>
    jwt.sign({ id: userId }, process.env.JWT_SECRET!, { expiresIn: "7d" });

export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name, email, password } = req.body;
    const user = await registerUser(name, email, password);
    res.cookie(COOKIE_NAME, signToken(user.id), cookieOptions(req));
    res.status(201).json({ user });
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email, password } = req.body;
    const user = await loginUser(email, password);
    res.cookie(COOKIE_NAME, signToken(user.id), cookieOptions(req));
    res.json({ user });
});

export const logout = asyncHandler(async (_req: AuthRequest, res: Response) => {
    res.clearCookie(COOKIE_NAME);
    res.json({ message: "Logged out" });
});

export const getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await getUserById(req.user.id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
});

export const updateCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, email } = req.body;
    const user = await updateUserById(req.user.id, name, email);
    res.json({ user });
});
