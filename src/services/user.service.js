import { prisma } from "../prisma/index.js";

class UserService {
    signUp = async (input) => {
        try {
            await prisma.user.create({
                data: input
            });
        } catch (error) {
            throw error;
        }
    };
}

export const userService = new UserService();
