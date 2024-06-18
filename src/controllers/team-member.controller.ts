import { Request, Response } from 'express';
import { Prisma, TeamMemberAccountStatus } from '@prisma/client';
import { catchAsync, CustomError } from '../utils';
import { teamMemberService } from '../services';
import {
    AdminTeamMemberByIdRequestParams,
    AdminUpdateTeamMemberRequestBody,
    EmptyParams,
    LoginRequestBody,
    ResBody,
    TeamMemberCreatePasswordRequestBody,
} from '../types';

class TeamMemberController {
    create = catchAsync(
        async (
            req: Request<EmptyParams, ResBody, Prisma.TeamMemberCreateInput>,
            res,
        ) => {
            const {
                body,
                locals: { user },
            } = req;

            const data = {
                firstName: body.firstName,
                lastName: body.lastName,
                email: body.email,
                position: body.position,
                joinDate: body.joinDate,
                adminId: user.id,
            };

            if (
                !data.firstName ||
                !data.lastName ||
                !data.email ||
                !data.position ||
                !data.joinDate
            ) {
                throw new CustomError(
                    'All fields are required: First name, Last Name, Email, Position',
                    400,
                );
            }

            const teamMember = await teamMemberService.create(data);
            res.status(201).send({
                data: teamMember,
            });
        },
    );

    createPassword = catchAsync(
        async (
            req: Request<
                EmptyParams,
                ResBody,
                TeamMemberCreatePasswordRequestBody
            >,
            res: Response,
        ) => {
            const {
                headers,
                body: { password, passwordConfirm, email },
            } = req;

            if (!headers.authorization) {
                throw new CustomError('Invite Token is missing', 401);
            }
            const [prefix, token] = headers.authorization.split(' ');

            if (!prefix || !token) {
                throw new CustomError(
                    'Token was not sent in correct form',
                    400,
                );
            }

            if (!password || !passwordConfirm || !email) {
                throw new CustomError(
                    'All fields are required: Password, Password Confirmation, Email',
                    400,
                );
            }

            if (password !== passwordConfirm) {
                throw new CustomError(
                    'Password and Password Confirmation must match',
                    400,
                );
            }

            await teamMemberService.createPassword(token, password, email);

            res.status(200).json({
                message:
                    'You successfully created a password. Now, you can log in',
            });
        },
    );

    getAll = catchAsync(async (req, res) => {
        const {
            locals: { user },
        } = req;
        const teamMembers = await teamMemberService.getAll(user.id);

        res.status(200).json({
            data: teamMembers,
        });
    });

    deactivate = catchAsync(
        async (req: Request<AdminTeamMemberByIdRequestParams>, res) => {
            const {
                locals: { user },
                params,
            } = req;
            await teamMemberService.changeStatus(
                user.id,
                params.id,
                TeamMemberAccountStatus.DEACTIVATED,
            );

            res.status(204).send();
        },
    );

    delete = catchAsync(
        async (req: Request<AdminTeamMemberByIdRequestParams>, res) => {
            const {
                locals: { user },
                params,
            } = req;
            await teamMemberService.delete(user.id, params.id);

            res.status(204).send();
        },
    );

    reactivate = catchAsync(
        async (req: Request<AdminTeamMemberByIdRequestParams>, res) => {
            const {
                locals: { user },
                params,
            } = req;
            await teamMemberService.changeStatus(user.id, params.id, 'ACTIVE');

            res.status(204).send();
        },
    );

    update = catchAsync(
        async (
            req: Request<
                AdminTeamMemberByIdRequestParams,
                ResBody,
                AdminUpdateTeamMemberRequestBody
            >,
            res,
        ) => {
            const {
                locals: { user },
                params,
                body,
            } = req;
            const updateData: Prisma.TeamMemberUpdateInput = {};

            if (body.firstName) {
                updateData.firstName = body.firstName;
            }
            if (body.lastName) {
                updateData.lastName = body.lastName;
            }
            if (body.position) {
                updateData.position = body.position;
            }
            if (body.joinDate) {
                updateData.joinDate = body.joinDate;
            }

            await teamMemberService.update(user.id, params.id, updateData);
            res.status(204).send();
        },
    );

    login = catchAsync(
        async (req: Request<EmptyParams, ResBody, LoginRequestBody>, res) => {
            const {
                body: { email, password },
            } = req;

            if (!email || !password) {
                throw new CustomError(
                    'All fields required: email and password',
                    400,
                );
            }

            const jwt = await teamMemberService.login(email, password);
            res.status(200).json({
                token: jwt,
            });
        },
    );

    getMe = catchAsync(async (req, res) => {
        const {
            locals: { user },
        } = req;
        const me = await teamMemberService.getMe(user.id);

        res.status(200).json({
            data: me,
        });
    });
}

export const teamMemberController = new TeamMemberController();
