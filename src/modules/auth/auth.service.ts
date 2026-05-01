import prisma from "../../config/prisma";
import bcrypt from "bcrypt";

export const registerUser = async (name: string, email: string, password: string) => {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        throw { status: 400, message: "Email already in use" };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    return prisma.user.create({
        data: { name, email, password: passwordHash },
        select: { id: true, name: true, email: true },
    });
};

export const loginUser = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
        throw { status: 401, message: "Invalid credentials" };
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        throw { status: 401, message: "Invalid credentials" };
    }

    return { id: user.id, name: user.name, email: user.email };
};

export const getUserById = async (userId: string) => {
    return prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true },
    });
};

export const updateUserById = async (userId: string, name: string, email: string) => {
    const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
    });

    if (existingUser && existingUser.id !== userId) {
        throw { status: 400, message: "Email already in use" };
    }

    return prisma.user.update({
        where: { id: userId },
        data: { name, email },
        select: { id: true, name: true, email: true },
    });
};
