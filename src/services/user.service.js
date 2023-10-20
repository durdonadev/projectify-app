import { prisma } from "../prisma/index.js";
import { bcrypt } from "../utils/bcrypt.js";
import { crypto } from "../utils/crypto.js";
import { mailer } from "../utils/mailer.js";
import { date } from "../utils/date.js";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";

class UserService {
    signUp = async (input) => {
        try {
            const hashedPassword = await bcrypt.hash(input.password);
            const activationToken = crypto.createToken();
            const hashedActivationToken = crypto.hash(activationToken);
            await prisma.user.create({
                data: {
                    ...input,
                    password: hashedPassword,
                    activationToken: hashedActivationToken
                }
            });
            await mailer.sendActivationMail(input.email, activationToken);
        } catch (error) {
            throw error;
        }
    };

    login = async (input) => {
        try {
            const user = await prisma.user.findFirst({
                where: {
                    email: input.email
                },
                select: {
                    id: true,
                    status: true,
                    password: true
                }
            });

            if (!user) throw new Error("Invalid Credentials");

            if (user.status === "INACTIVE") {
                const activationToken = crypto.createToken();
                const hashedActivationToken = crypto.hash(activationToken);

                await prisma.user.update({
                    where: {
                        id: user.id
                    },
                    data: {
                        activationToken: hashedActivationToken
                    }
                });

                await mailer.sendActivationMail(input.email, activationToken);

                throw new Error(
                    "We just sent you activation email. Follow instructions"
                );
            }

            const isPasswordMatches = await bcrypt.compare(
                input.password,
                user.password
            );
            if (!isPasswordMatches) {
                throw new Error("Invalid Credentials");
            }

            const token = jwt.sign(
                {
                    userId: user.id
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "2 days"
                }
            );

            return token;
        } catch (error) {
            throw error;
        }
    };

    activate = async (token) => {
        try {
            const hashedActivationToken = crypto.hash(token);
            const user = await prisma.user.findFirst({
                where: {
                    activationToken: hashedActivationToken
                },
                select: {
                    id: true,
                    activationToken: true
                }
            });

            if (!user) {
                throw new Error("Invalid Token");
            }

            await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    status: "ACTIVE",
                    activationToken: null
                }
            });
        } catch (error) {
            console.log(error);
            throw error;
        }
    };

    forgotPassword = async (email) => {
        try {
            const user = await prisma.user.findFirst({
                where: {
                    email
                },
                select: {
                    id: true
                }
            });

            if (!user) {
                throw new Error(
                    "We could not find a user with the email you provided"
                );
            }

            const passwordResetToken = crypto.createToken();
            const hashedPasswordResetToken = crypto.hash(passwordResetToken);

            await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    passwordResetToken: hashedPasswordResetToken,
                    passwordResetTokenExpirationDate: date.addMinutes(10)
                }
            });

            await mailer.sendPasswordResetToken(email, passwordResetToken);
        } catch (error) {
            throw error;
        }
    };

    resetPassword = async (token, password) => {
        try {
            const hashedPasswordResetToken = crypto.hash(token);
            const user = await prisma.user.findFirst({
                where: {
                    passwordResetToken: hashedPasswordResetToken
                },
                select: {
                    id: true,
                    passwordResetToken: true,
                    passwordResetTokenExpirationDate: true
                }
            });

            if (!user) {
                throw new Error("Invalid Token");
            }

            const currentTime = new Date();
            const tokenExpDate = new Date(
                user.passwordResetTokenExpirationDate
            );

            if (tokenExpDate < currentTime) {
                // Token Expired;
                throw new Error("Reset Token Expired");
            }

            await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    password: await bcrypt.hash(password),
                    passwordResetToken: null,
                    passwordResetTokenExpirationDate: null
                }
            });
        } catch (error) {
            throw error;
        }
    };

    getMe = async (userId) => {
        try {
            const user = await prisma.user.findUnique({
                where: {
                    id: userId
                },
                select: {
                    firstName: true,
                    lastName: true,
                    preferredFirstName: true,
                    email: true
                }
            });

            if (!user) {
                throw new Error("User not found");
            }

            return user;
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

    createTask = async (userId, input) => {
        const id = uuid();
        const task = {
            ...input,
            status: "TODO",
            id
        };

        try {
            await prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    tasks: {
                        push: task
                    }
                }
            });

            return task;
        } catch (error) {
            throw error;
        }
    };

    getTasks = async (userId) => {
        try {
            const tasks = await prisma.user.findUnique({
                where: {
                    id: userId
                },
                select: {
                    tasks: true
                }
            });

            return tasks;
        } catch (error) {
            throw error;
        }
    };

    getTask = async (userId, taskId) => {
        try {
            const user = await prisma.user.findUnique({
                where: {
                    id: userId
                },
                select: {
                    tasks: true
                }
            });

            const task = user.tasks.find((task) => task.id === taskId);
            if (!task) {
                throw new Error("Task not found");
            }

            return task;
        } catch (error) {
            throw error;
        }
    };

    deleteTask = async (userId, taskId) => {
        try {
            const user = await prisma.user.findUnique({
                where: {
                    id: userId
                },
                select: {
                    tasks: true
                }
            });

            const tasksToKeep = user.tasks.filter((task) => task.id !== taskId);
            if (tasksToKeep.length === user.tasks.length) {
                throw new Error("Task not found");
            }

            await prisma.user.update({
                where: {
                    id: userId
                },

                data: {
                    tasks: tasksToKeep
                }
            });
        } catch (error) {
            throw error;
        }
    };

    updateTask = async (userId, taskId, input) => {
        try {
            const user = await prisma.user.findUnique({
                where: {
                    id: userId
                },

                select: {
                    tasks: true
                }
            });

            const tasksNotToUpdate = [];
            let taskToUpdate = null;

            user.tasks.forEach((task) => {
                if (task.id === taskId) {
                    taskToUpdate = task;
                } else {
                    tasksNotToUpdate.push(task);
                }
            });

            if (!taskToUpdate) {
                throw new Error("Task not found");
            }

            const updatedTask = {
                ...taskToUpdate,
                ...input
            };

            await prisma.user.update({
                where: {
                    id: userId
                },

                data: {
                    tasks: [...tasksNotToUpdate, updatedTask]
                }
            });
        } catch (error) {
            throw error;
        }
    };
}

export const userService = new UserService();
