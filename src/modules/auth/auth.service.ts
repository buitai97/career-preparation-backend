import prisma from "../../config/prisma";
import bcrypt from "bcrypt";

export const registerUser = async (name: string, email: string, password: string,) => {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw {
            status: 400,
            message: "Email already in use",
        }
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });

    return user;
}

export const loginUser = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw {
            status: 401,
            message: "Invalid credentials",
        };
    }


    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
        throw {
            status: 401,
            message: "Invalid credentials",
        };
    }

    return user;
};

export const getUserById = async (userId: string) => {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
        },
    });
};

export const updateUserById = async (userId: string, name: string, email: string) => {
    const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
    });

    if (existingUser && existingUser.id !== userId) {
        throw {
            status: 400,
            message: "Email already in use",
        };
    }

    return prisma.user.update({
        where: { id: userId },
        data: {
            name,
            email,
        },
        select: {
            id: true,
            name: true,
            email: true,
        },
    });
};

