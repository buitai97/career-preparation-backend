import { z } from "zod";

const createUserSchema = z.object({
    name: z.string().min(2),
    email: z.email(),
    password: z.coerce.string().min(6),
});

const loginUserSchema = z.object({
    email: z.email(),
    password: z.coerce.string().min(6),
});

const updateCurrentUserSchema = z.object({
    name: z.string().trim().min(2),
    email: z.email(),
});

export const AuthSchemas = {
    createUser: createUserSchema,
    loginUser: loginUserSchema,
    updateCurrentUser: updateCurrentUserSchema,
};
