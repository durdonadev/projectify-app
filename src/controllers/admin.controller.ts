import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { adminService } from '../services';
import { catchAsync, CustomError } from '../utils';
import {
    EmptyParams,
    ResBody,
    LoginRequestBody,
    EmptyBody,
    AdminActivationQuery,
    ForgetPasswordRequestBody,
    ResetPasswordRequestBody,
    AdminCreateTaskRequestBody,
    AdminTaskByIdRequestParams,
    AdminUpdateTaskRequestBody,
} from '../types';

class AdminController {
    signUp = catchAsync(
        async (
            req: Request<EmptyParams, ResBody, Prisma.AdminCreateInput>,
            res: Response,
        ) => {
            const { body } = req;

            const input: Prisma.AdminCreateInput = {
                email: body.email,
                preferredFirstName: body.preferredFirstName,
                firstName: body.firstName,
                lastName: body.lastName,
                password: body.password,
            };

            if (body.company && body.company.name && body.company.position) {
                input.company = {
                    name: body.company.name,
                    position: body.company.position,
                };
            }

            await adminService.signUp(input);
            res.status(201).json({
                message:
                    'We have just sent you an email. Please,  Activate your account.',
            });
        },
    );

    login = catchAsync(
        async (
            req: Request<EmptyParams, ResBody, LoginRequestBody>,
            res: Response,
        ) => {
            const { body } = req;

            const input: LoginRequestBody = {
                email: body.email,
                password: body.password,
            };

            const jwt = await adminService.login(input);

            res.status(200).json({
                token: jwt,
            });
        },
    );

    activate = catchAsync(
        async (
            req: Request<EmptyParams, ResBody, EmptyBody, AdminActivationQuery>,
            res: Response,
        ) => {
            const { query } = req;

            if (!query.activationToken) {
                throw new CustomError('Activation Token is missing', 400);
            }

            await adminService.activate(query.activationToken);

            res.status(200).json({
                message: 'Success',
            });
        },
    );

    forgotPassword = catchAsync(
        async (
            req: Request<EmptyParams, ResBody, ForgetPasswordRequestBody>,
            res: Response<ResBody>,
        ) => {
            await adminService.forgotPassword(req.body.email);

            res.status(200).json({
                message:
                    'We emailed you an instruction to reset your password.',
            });
        },
    );

    resetPassword = catchAsync(
        async (
            req: Request<EmptyParams, ResBody, ResetPasswordRequestBody>,
            res,
        ) => {
            const {
                body: { password, passwordConfirm },
                headers,
            } = req;

            if (!headers.authorization) {
                throw new CustomError('Password Reset Token is missing', 400);
            }

            const [bearer, token] = headers.authorization.split(' ');
            if (bearer !== 'Bearer' || !token) {
                throw new CustomError('Invalid Password Reset Token', 400);
            }

            await adminService.resetPassword(
                { password, passwordConfirm },
                token,
            );

            res.status(200).json({
                message: 'Password successfully updated',
            });
        },
    );

    getMe = catchAsync(async (req: Request, res: Response) => {
        const {
            locals: { user },
        } = req;

        const me = await adminService.getMe(user.id);

        res.status(200).json({
            data: me,
        });
    });

    createTask = catchAsync(
        async (
            req: Request<EmptyParams, ResBody, AdminCreateTaskRequestBody>,
            res,
        ) => {
            const {
                locals: { user },
                body,
            } = req;

            const input = {
                title: body.title,
                description: body.description,
                due: body.due,
            };

            if (!input.title || !input.due) {
                throw new CustomError(
                    'Both Title and Due Date are required',
                    404,
                );
            }

            const data = await adminService.createTask(user.id, input);

            res.status(201).json({
                data,
            });
        },
    );

    getTasks = catchAsync(async (req, res) => {
        const {
            locals: { user },
        } = req;

        const tasks = await adminService.getTasks(user.id);

        res.status(200).json({
            data: tasks,
        });
    });

    deleteTask = catchAsync(
        async (req: Request<AdminTaskByIdRequestParams>, res) => {
            const {
                params,
                locals: { user },
            } = req;

            await adminService.deleteTask(user.id, params.taskId);
            res.status(204).send();
        },
    );

    updateTask = catchAsync(
        async (
            req: Request<
                AdminTaskByIdRequestParams,
                ResBody,
                AdminUpdateTaskRequestBody
            >,
            res,
        ) => {
            const {
                params,
                body,
                locals: { user },
            } = req;

            const updateData = this.buildTaskUpdateData(body);

            if (!Object.keys(updateData).length) {
                throw new CustomError('Update data is required', 400);
            }

            await adminService.updateTask(user.id, params.taskId, updateData);
            res.status(204).send();
        },
    );

    private buildTaskUpdateData = (body: AdminUpdateTaskRequestBody) => {
        const data: AdminUpdateTaskRequestBody = {};

        if (body.status) {
            data.status = body.status;
        }

        if (body.title) {
            data.title = body.title;
        }

        if (body.description) {
            data.description = body.description;
        }

        if (body.due) {
            data.due = body.due;
        }

        return data;
    };
}

export const adminController = new AdminController();
