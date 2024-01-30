import { prisma } from "../prisma/index.js";
import { bcrypt } from "../utils/bcrypt.js";
import { crypto } from "../utils/crypto.js";
import { mailer } from "../utils/mailer.js";
import { date } from "../utils/date.js";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { CustomError } from "../utils/custom-error.js";

class AdminService {
    signUp = async (adminInput, companyInput) => {
        const hashedPassword = await bcrypt.hash(adminInput.password);
        const activationToken = crypto.createToken();
        const hashedActivationToken = crypto.hash(activationToken);
        const admin = await prisma.admin.create({
            data: {
                ...adminInput,
                email: adminInput.email.toLowerCase(),
                password: hashedPassword,
                activationToken: hashedActivationToken
            },
            select: {
                id: true
            }
        });

        if (companyInput.name && companyInput.position) {
            await prisma.company.create({
                data: {
                    ...companyInput,
                    adminId: admin.id
                }
            });
        }

        await mailer.sendActivationMail(adminInput.email, activationToken);
    };

    login = async (input) => {
        const admin = await prisma.admin.findFirst({
            where: {
                email: input.email
            },
            select: {
                id: true,
                status: true,
                password: true
            }
        });

        if (!admin) throw new CustomError("Admin does not exist", 404);

        if (admin.status === "INACTIVE") {
            const activationToken = crypto.createToken();
            const hashedActivationToken = crypto.hash(activationToken);

            await prisma.admin.update({
                where: {
                    id: admin.id
                },
                data: {
                    activationToken: hashedActivationToken
                }
            });

            await mailer.sendActivationMail(input.email, activationToken);

            throw new CustomError(
                "We just sent you activation email. Follow instructions",
                400
            );
        }

        const isPasswordMatches = await bcrypt.compare(
            input.password,
            admin.password
        );
        if (!isPasswordMatches) {
            throw new CustomError("Invalid Credentials", 401);
        }

        const token = jwt.sign(
            {
                adminId: admin.id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "2 days"
            }
        );

        return token;
    };

    activate = async (token) => {
        const hashedActivationToken = crypto.hash(token);
        const admin = await prisma.admin.findFirst({
            where: {
                activationToken: hashedActivationToken
            },
            select: {
                id: true,
                activationToken: true
            }
        });

        if (!admin) {
            throw new CustomError(
                "Admin does not exist with with provided Activation Token",
                404
            );
        }

        await prisma.admin.update({
            where: {
                id: admin.id
            },
            data: {
                status: "ACTIVE",
                activationToken: null
            }
        });
    };

    forgotPassword = async (email) => {
        const admin = await prisma.admin.findFirst({
            where: {
                email
            },
            select: {
                id: true
            }
        });

        if (!admin) {
            throw new CustomError(
                "Admin does not exist with provided email",
                404
            );
        }

        const passwordResetToken = crypto.createToken();
        const hashedPasswordResetToken = crypto.hash(passwordResetToken);

        await prisma.admin.update({
            where: {
                id: admin.id
            },
            data: {
                passwordResetToken: hashedPasswordResetToken,
                passwordResetTokenExpirationDate: date.addMinutes(10)
            }
        });

        await mailer.sendPasswordResetTokenAdmin(email, passwordResetToken);
    };

    resetPassword = async (token, password) => {
        const hashedPasswordResetToken = crypto.hash(token);
        const admin = await prisma.admin.findFirst({
            where: {
                passwordResetToken: hashedPasswordResetToken
            },
            select: {
                id: true,
                passwordResetToken: true,
                passwordResetTokenExpirationDate: true
            }
        });

        if (!admin) {
            throw new CustomError(
                "Admin does not exist with  provided Password Reset Token",
                404
            );
        }

        const currentTime = new Date();
        const tokenExpDate = new Date(admin.passwordResetTokenExpirationDate);

        if (tokenExpDate < currentTime) {
            // Token Expired;
            throw new CustomError(
                "Password Reset Token Expired: Request a new one",
                400
            );
        }

        await prisma.admin.update({
            where: {
                id: admin.id
            },
            data: {
                password: await bcrypt.hash(password),
                passwordResetToken: null,
                passwordResetTokenExpirationDate: null
            }
        });
    };

    getMe = async (adminId) => {
        const admin = await prisma.admin.findUnique({
            where: {
                id: adminId
            },
            select: {
                firstName: true,
                lastName: true,
                preferredFirstName: true,
                email: true,
                id: true
            }
        });

        if (!admin) {
            throw new CustomError("Admin does not exist", 404);
        }

        const company = await prisma.company.findFirst({
            where: { adminId: admin.id },
            select: {
                name: true,
                position: true
            }
        });

        return { ...admin, company, role: "admin" };
    };

    createTask = async (adminId, input) => {
        const id = uuid();
        const task = {
            ...input,
            status: "TODO",
            id
        };

        await prisma.admin.update({
            where: {
                id: adminId
            },
            data: {
                tasks: {
                    push: task
                }
            }
        });

        return task;
    };

    getTasks = async (adminId) => {
        const tasks = await prisma.admin.findUnique({
            where: {
                id: adminId
            },

            select: {
                tasks: true
            }
        });

        return tasks;
    };

    getTask = async (adminId, taskId) => {
        const admin = await prisma.admin.findUnique({
            where: {
                id: adminId
            },

            select: {
                tasks: true
            }
        });

        const task = admin.tasks.find((task) => task.id === taskId);
        if (!task) {
            throw new CustomError("Task not found", 404);
        }

        return task;
    };

    deleteTask = async (adminId, taskId) => {
        const admin = await prisma.admin.findUnique({
            where: {
                id: adminId
            },

            select: {
                tasks: true
            }
        });

        const tasksToKeep = admin.tasks.filter((task) => task.id !== taskId);

        if (tasksToKeep.length === admin.tasks.length) {
            throw new CustomError("Task does not exist", 404);
        }

        await prisma.admin.update({
            where: {
                id: adminId
            },

            data: {
                tasks: tasksToKeep
            }
        });
    };

    updateTask = async (adminId, taskId, input) => {
        const admin = await prisma.admin.findUnique({
            where: {
                id: adminId
            },

            select: {
                tasks: true
            }
        });

        const tasksNotToUpdate = [];
        let taskToUpdate = null;

        admin.tasks.forEach((task) => {
            if (task.id === taskId) {
                taskToUpdate = task;
            } else {
                tasksNotToUpdate.push(task);
            }
        });

        if (!taskToUpdate) {
            throw new CustomError("Task does not exist", 404);
        }

        const updatedTask = {
            ...taskToUpdate,
            ...input
        };

        await prisma.admin.update({
            where: {
                id: adminId
            },

            data: {
                tasks: [...tasksNotToUpdate, updatedTask]
            }
        });
    };
}

export const adminService = new AdminService();
