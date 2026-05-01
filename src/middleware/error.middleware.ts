import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Zod validation errors
    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: err.issues,
        });
    }

    // Prisma known errors (like unique constraint)
    if (err.code === "P2002") {
        return res.status(409).json({
            success: false,
            message: "Duplicate field value",
        });
    }

    if (err.code === "P2003") {
        return res.status(401).json({
            success: false,
            message: "Session is no longer valid. Please log in again.",
        });
    }



    // JWT errors
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }

    if (err.status) {
        return res.status(err.status).json({
            success: false,
            message: err.message,
        });
    }
    if (err instanceof Error) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
    return res.status(500).json({
        success: false,
        message: err.message || "Internal server error",
    });

};
