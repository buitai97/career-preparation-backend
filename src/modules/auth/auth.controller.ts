import { Request, Response, NextFunction } from "express";
import { registerUser, loginUser } from "./auth.service";
import { generateToken } from "../../utils/jwt";

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;

        const user = await registerUser(name, email, password);

        const token = generateToken(user.id);

        res.status(201).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        const user = await loginUser(email, password);

        const token = generateToken(user.id);

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        next(error);
    }
};
