import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import resumeRoutes from "./modules/resume/resume.routes";
import interviewRoutes from "./modules/interview/interview.routes";
import { errorHandler } from "./middleware/error.middleware";
import { globalRateLimiter } from "./middleware/rateLimit.middleware";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import cookieParser from "cookie-parser";
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(globalRateLimiter);
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:3000"]

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

// Import routes
app.get('/', (_req, res) => {
    res.send('API running');
});
app.get("/health", (_req, res) => {
    res.json({ status: "OK" });
});

app.use("/api/auth", authRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/interviews", interviewRoutes);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(errorHandler);
export default app;
