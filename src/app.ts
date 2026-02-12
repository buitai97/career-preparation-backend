import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes

app.get("/health", (req, res) => {
    res.json({ status: "OK" });
});

app.use("/api/auth", authRoutes);
export default app;