import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import resumeRoutes from "./modules/resume/resume.routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Import routes

app.get("/health", (req, res) => {
    res.json({ status: "OK" });
});

app.use("/api/auth", authRoutes);
app.use("/api/resumes", resumeRoutes);
export default app;