import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/express";
import jwt from "jsonwebtoken";

export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        req.user = { id: decoded.id };
        next();
    } catch {
        return res.status(401).json({ message: "Invalid token" });
    }
};
