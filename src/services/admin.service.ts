import { AdminAccountStatus, Prisma, TaskStatus } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { prisma } from '../prisma';
import { crypto, mailer, bcrypt, date, CustomError } from '../utils';
import {
    AdminActivationQuery,
    AdminCreateTaskRequestBody,
    AdminUpdateTaskRequestBody,
    ForgetPasswordRequestBody,
    LoginRequestBody,
    ResetPasswordRequestBody,
    Roles,
} from '../types';

class AdminService {
    signUp = async (input: Prisma.AdminCreateInput) => {
        const hashedPassword = await bcrypt.hash(input.password);
        const activationToken = crypto.createToken();
        const hashedActivationToken = crypto.hash(activationToken);
        const admin = await prisma.admin.create({
            data: {
                ...input,
                email: input.email.toLowerCase(),
                password: hashedPassword,
                activationToken: hashedActivationToken,
            },
            select: {
                id: true,
            },
        });

        if (admin) {
            await mailer.sendActivationMail(input.email, activationToken);
        }
    };

    login = async (input: LoginRequestBody) => {
        const admin = await prisma.admin.findFirst({
            where: {
                email: input.email,
            },
            select: {
                id: true,
                status: true,
                password: true,
            },
        });

        if (!admin) throw new CustomError('Admin does not exist', 404);

        if (admin.status === AdminAccountStatus.INACTIVE) {
            const activationToken = crypto.createToken();
            const hashedActivationToken = crypto.hash(activationToken);

            await prisma.admin.update({
                where: {
                    id: admin.id,
                },
                data: {
                    activationToken: hashedActivationToken,
                },
            });

            await mailer.sendActivationMail(input.email, activationToken);

            throw new CustomError(
                'We just sent you activation email. Follow instructions',
                400,
            );
        }

        const isPasswordMatches = await bcrypt.compare(
            input.password,
            admin.password,
        );
        if (!isPasswordMatches) {
            throw new CustomError('Invalid Credentials', 401);
        }

        const token = jwt.sign(
            {
                id: admin.id,
                role: Roles.ADMIN,
            },
            process.env.JWT_SECRET as jwt.Secret,
            {
                expiresIn: '2 days',
            },
        );

        return token;
    };

    activate = async (token: AdminActivationQuery['activationToken']) => {
        const hashedActivationToken = crypto.hash(token);
        const admin = await prisma.admin.findFirst({
            where: {
                activationToken: hashedActivationToken,
            },
            select: {
                id: true,
                activationToken: true,
            },
        });

        if (!admin) {
            throw new CustomError(
                'Admin does not exist with with provided Activation Token',
                404,
            );
        }

        await prisma.admin.update({
            where: {
                id: admin.id,
            },
            data: {
                status: AdminAccountStatus.ACTIVE,
                activationToken: null,
            },
        });
    };

    forgotPassword = async (email: ForgetPasswordRequestBody['email']) => {
        const admin = await prisma.admin.findFirst({
            where: {
                email,
            },
            select: {
                id: true,
            },
        });

        if (!admin) {
            throw new CustomError(
                'Admin does not exist with provided email',
                404,
            );
        }

        const passwordResetToken = crypto.createToken();
        const hashedPasswordResetToken = crypto.hash(passwordResetToken);

        await prisma.admin.update({
            where: {
                id: admin.id,
            },
            data: {
                passwordResetToken: hashedPasswordResetToken,
                passwordResetTokenExpirationDate: date.addMinutes(10),
            },
        });

        await mailer.sendPasswordResetToken(
            email,
            passwordResetToken,
            Roles.ADMIN,
        );
    };

    resetPassword = async (
        passwords: ResetPasswordRequestBody,
        token: string,
    ) => {
        if (passwords.password !== passwords.passwordConfirm) {
            throw new CustomError(
                'Password and Password Confirmation does not match',
                400,
            );
        }
        const hashedPasswordResetToken = crypto.hash(token);
        const admin = await prisma.admin.findFirst({
            where: {
                passwordResetToken: hashedPasswordResetToken,
            },
            select: {
                id: true,
                passwordResetToken: true,
                passwordResetTokenExpirationDate: true,
            },
        });

        if (!admin) {
            throw new CustomError(
                'Admin does not exist with  provided Password Reset Token',
                404,
            );
        }

        if (!admin.passwordResetTokenExpirationDate) {
            throw new CustomError(
                'Server error: Password reset token expiration date is missing. Cannot update the password',
                500,
            );
        }

        const currentTime = new Date();
        const tokenExpDate = new Date(admin.passwordResetTokenExpirationDate);

        if (tokenExpDate < currentTime) {
            // Token Expired;
            throw new CustomError(
                'Password Reset Token Expired: Request a new one',
                400,
            );
        }

        await prisma.admin.update({
            where: {
                id: admin.id,
            },
            data: {
                password: await bcrypt.hash(passwords.password),
                passwordResetToken: null,
                passwordResetTokenExpirationDate: null,
            },
        });
    };

    getMe = async (adminId: string) => {
        const admin = await prisma.admin.findUnique({
            where: {
                id: adminId,
            },
            select: {
                firstName: true,
                lastName: true,
                preferredFirstName: true,
                email: true,
                id: true,
                company: true,
                role: true,
            },
        });

        if (!admin) {
            throw new CustomError('Admin does not exist', 404);
        }

        return admin;
    };

    createTask = async (adminId: string, input: AdminCreateTaskRequestBody) => {
        const id = uuid();
        const task = {
            ...input,
            status: TaskStatus.TODO,
            id,
        };

        await prisma.admin.update({
            where: {
                id: adminId,
            },
            data: {
                tasks: {
                    push: task,
                },
            },
        });

        return task;
    };

    getTasks = async (adminId: string) => {
        const tasks = await prisma.admin.findUnique({
            where: {
                id: adminId,
            },

            select: {
                tasks: true,
            },
        });

        return tasks;
    };

    deleteTask = async (adminId: string, taskId: string) => {
        const admin = await prisma.admin.findUnique({
            where: {
                id: adminId,
            },

            select: {
                tasks: true,
            },
        });

        if (!admin) {
            throw new CustomError('Admin  does not exist', 404);
        }

        const tasksToKeep = admin.tasks.filter((task) => task.id !== taskId);

        if (tasksToKeep.length === admin.tasks.length) {
            throw new CustomError('Task does not exist', 404);
        }

        await prisma.admin.update({
            where: {
                id: adminId,
            },

            data: {
                tasks: tasksToKeep,
            },
        });
    };

    updateTask = async (
        adminId: string,
        taskId: string,
        updateData: AdminUpdateTaskRequestBody,
    ) => {
        const admin = await prisma.admin.findUnique({
            where: {
                id: adminId,
            },

            select: {
                tasks: true,
            },
        });

        if (!admin) {
            throw new CustomError('Admin does not exist', 404);
        }
        let taskFound = false;

        for (let i = 0; i < admin?.tasks.length; i++) {
            const task = admin?.tasks[i];
            if (task.id === taskId) {
                admin.tasks[i] = { ...admin?.tasks[i], ...updateData };
                taskFound = true;
                break;
            }
        }

        if (!taskFound) {
            throw new CustomError('Task does not exist', 404);
        }

        await prisma.admin.update({
            where: {
                id: adminId,
            },

            data: {
                tasks: admin.tasks,
            },
        });
    };
}

export const adminService = new AdminService();
