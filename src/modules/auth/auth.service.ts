import prisma from "../../config/prisma";
import bcrypt from "bcrypt";

export const registerUser = async (name: string, email: string, password: string,) => {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error("Email already in use");
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
        throw new Error("Invalid credentials");
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
        throw new Error("Invalid credentials");
    }

    return user;
};

