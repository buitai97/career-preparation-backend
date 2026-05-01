import rateLimit from "express-rate-limit";

export const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // max 100 requests per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
});

export const aiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // only 10 AI calls per 15 min
    message: {
        success: false,
        message: "AI request limit exceeded. Try again later.",
    },
});