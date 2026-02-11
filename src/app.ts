import express from "express";
import cors from "cors";
import testRoute from "./modules/test/test.route";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
app.use("/api/test", testRoute);

app.get("/health", (req, res) => {
    res.json({ status: "OK" });
});
app.get("/ping", (req, res) => {
    res.send("pong");
});

export default app;