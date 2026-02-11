import { Router } from "express";
import prisma from "../../config/prisma";

const router = Router();

router.post("/create-user", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password,
            },
        });

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

export default router;
