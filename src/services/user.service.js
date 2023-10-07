import { prisma } from "../prisma/index.js";
// import { hashFunction, generateSalt } from "../utils/hash.js";
import { hasher } from "../utils/hash.js";

class UserService {
    signUp = async (input) => {
        try {
            const hashedPassword = await hasher.hash(input.password);
            // Check if the email already exists in the database
            const existingUser = await prisma.user.findUnique({
                where: {
                    email: input.email
                }
            });

            if (existingUser) {
                throw new Error("Email already in use");
            }

            // If the email is unique, create the new user
            await prisma.user.create({
                data: { ...input, password: hashedPassword }
            });
        } catch (error) {
            throw error;
        }
    };

    login = async (input) => {
        try {
            const user = await prisma.user.findFirst({
                where: {
                    email: input.email
                }
            });

            if (!user) {
                throw new Error("Invalid Credentials");
            }

            const isPasswordMatching = await hasher.compare(
                input.password,
                user.password
            );
            if (!isPasswordMatching) {
                throw new Error("Invalid Credentials");
            }
        } catch (error) {
            throw error;
        }
    };

    update = async (input, id) => {
        try {
            await prisma.user.update({
                where: { id },
                data: input
            });
        } catch (error) {
            throw error;
        }
    };
}

export const userService = new UserService();
