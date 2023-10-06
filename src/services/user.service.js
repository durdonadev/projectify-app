import { prisma } from "../prisma/index.js";
import { hashFunction, generateSalt } from "../utils/hash.js";

class UserService {
    signUp = async (input) => {
        try {
            const salt = generateSalt();
            const hashedPassword = hashFunction(input.password + salt);
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
                data: { ...input, password: `${salt}.${hashedPassword}` }
            });
        } catch (error) {
            throw error;
        }
    };

    // login = async (input) => {
    //     try {
    //         const user = await prisma.user.findFirst({
    //             where: {
    //                 email: input.email
    //             }
    //         });

    //         if (user) {
    //             if (user.password !== input.password) {
    //                 throw new Error("Invalid Credentials");
    //             } else if (user.password === input.password) {
    //                 return user;
    //             }
    //         } else {
    //             throw new Error("Invalid Credentials");
    //         }
    //     } catch (error) {
    //         throw error;
    //     }
    // };

    login = async (input) => {
        try {
            const user = await prisma.user.findFirst({
                where: {
                    email: input.email
                }
            });

            if (user) {
                const [salt, userHashedPassword] = user.password.split(".");
                const hashedPassword = hashFunction(input.password + salt);
                if (userHashedPassword !== hashedPassword) {
                    throw new Error("Invalid Credentials");
                } else if (userHashedPassword === hashedPassword) {
                    return user;
                }
            } else {
                throw new Error("Invalid Credentials");
            }
        } catch (error) {
            throw error;
        }
    };
}

export const userService = new UserService();
