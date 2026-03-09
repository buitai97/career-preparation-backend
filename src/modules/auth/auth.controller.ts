import { Request, Response, NextFunction } from "express";
import { registerUser, loginUser, getUserById, updateUserById } from "./auth.service";
import { generateToken } from "../../utils/jwt";
import { AuthRequest } from "../../types/express";
import { asyncHandler } from "../../utils/asyncHandler";
import { CookieOptions } from "express";

const getAuthCookieOptions = (): CookieOptions => {
    const sameSite = (process.env.COOKIE_SAMESITE as "lax" | "strict" | "none" | undefined) || "lax";
    const secure = process.env.COOKIE_SECURE === "true";
    return {
        httpOnly: true,
        secure,
        sameSite,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    };
};

export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body

    const user = await registerUser(name, email, password);

    const token = generateToken(user.id);
    res.cookie("token", token, getAuthCookieOptions());
    res.status(201).json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
    });
});

export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body

        const user = await loginUser(email, password);

        const token = generateToken(user.id);
        res.cookie("token", token, getAuthCookieOptions());
        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error: any) {
        next(error.message ? { status: 400, message: error.message } : error);
    }
});

export const logout = (req: Request, res: Response) => {
    res.clearCookie("token", getAuthCookieOptions());
    res.json({ message: "Logged out successfully" });
}

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
