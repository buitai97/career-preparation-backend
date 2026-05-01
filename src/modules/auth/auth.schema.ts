import { z } from "zod";

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string().min(6),
});

const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(1),
});

const updateCurrentUserSchema = z.object({
    name: z.string().trim().min(2),
    email: z.email(),
});

export const AuthSchemas = {
    register: registerSchema,
    login: loginSchema,
    updateCurrentUser: updateCurrentUserSchema,
};
