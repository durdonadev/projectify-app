import { Prisma } from '@prisma/client';
import { Request } from 'express';
import { catchAsync, CustomError } from '../utils';
import { projectService } from '../services';
import {
    AdminAddContributorToProjectRequestBody,
    AdminChangeContributorStatusRequestBody,
    AdminChangeContributorStatusRequestParams,
    AdminChangeProjectStatusRequestBody,
    AdminProjectByIdRequestParams,
    AdminTeamMemberByIdRequestParams,
    AdminUpdateProjectRequestBody,
    EmptyParams,
    ResBody,
} from '../types';

class ProjectController {
    create = catchAsync(
        async (
            req: Request<EmptyParams, ResBody, Prisma.ProjectCreateInput>,
            res,
        ) => {
            const { body, locals } = req;
            const data: Prisma.ProjectCreateInput = {
                name: body.name,
                description: body.description,
                startDate: body.startDate,
                endDate: body.endDate,
                adminId: locals.user.id,
            };

            if (
                !data.name ||
                !data.description ||
                !data.startDate ||
                !data.endDate
            ) {
                throw new CustomError('All Fields are required', 400);
            }

            if (new Date(data.startDate) >= new Date(data.endDate)) {
                throw new CustomError(
                    'Start Date cannot be greated than End Date',
                    400,
                );
            }

            const project = await projectService.create(data);

            res.status(201).json({
                data: project,
            });
        },
    );

    getOne = catchAsync(
        async (req: Request<AdminProjectByIdRequestParams>, res) => {
            const {
                locals: { user },
                params,
            } = req;

            const project = await projectService.getOne(params.id, user.id);

            res.status(200).json({
                data: project,
            });
        },
    );

    update = catchAsync(
        async (
            req: Request<
                AdminProjectByIdRequestParams,
                ResBody,
                AdminUpdateProjectRequestBody
            >,
            res,
        ) => {
            const {
                body,
                params,
                locals: { user },
            } = req;
            const data: Prisma.ProjectUpdateInput = {};

            if (body.name) {
                data.name = body.name;
            }
            if (body.description) {
                data.description = body.description;
            }

            if (body.startDate && body.endDate) {
                data.startDate = body.startDate;
                data.endDate = body.endDate;
            }

            if (
                (data.startDate && !data.endDate) ||
                (!data.startDate && data.endDate)
            ) {
                throw new CustomError(
                    'Both Start date and End date is required',
                    400,
                );
            }

            if (!data.name && !data.description) {
                throw new CustomError('No update data provided', 400);
            }

            if (
                data.startDate &&
                data.endDate &&
                new Date(data.startDate as string) >=
                    new Date(data.endDate as string)
            ) {
                throw new CustomError(
                    'End date cannot be equal or less than Start date',
                    400,
                );
            }

            await projectService.update(params.id, user.id, data);
            res.status(204).send();
        },
    );

    getAll = catchAsync(async (req, res) => {
        const {
            locals: { user },
        } = req;

        const projects = await projectService.getAll(user.id);
        res.status(200).json({
            data: projects,
        });
    });

    changeStatus = catchAsync(
        async (
            req: Request<
                AdminProjectByIdRequestParams,
                ResBody,
                AdminChangeProjectStatusRequestBody
            >,
            res,
        ) => {
            const {
                body,
                params,
                locals: { user },
            } = req;

            await projectService.changeStatus(params.id, user.id, body.status);
            res.status(204).send();
        },
    );

    addContributor = catchAsync(
        async (
            req: Request<
                AdminTeamMemberByIdRequestParams,
                ResBody,
                AdminAddContributorToProjectRequestBody
            >,
            res,
        ) => {
            const {
                locals: { user },
                body,
                params,
            } = req;

            if (!body.teamMemberId) {
                throw new CustomError('teamMemberId is required', 400);
            }

            const data = await projectService.addContributor(
                params.id,
                body.teamMemberId,
                user.id,
            );

            res.status(200).json({
                data,
            });
        },
    );

    changeContributorStatus = catchAsync(
        async (
            req: Request<
                AdminChangeContributorStatusRequestParams,
                ResBody,
                AdminChangeContributorStatusRequestBody
            >,
            res,
        ) => {
            const {
                locals: { user },
                params,
                body,
            } = req;

            await projectService.changeContributorStatus(
                params.id,
                params.teamMemberId,
                user.id,
                body.status,
            );

            res.status(204).send();
        },
    );

    getContributors = catchAsync(
        async (req: Request<AdminProjectByIdRequestParams>, res) => {
            const {
                locals: { user },
                params,
            } = req;

            const contributors = await projectService.getContributors(
                params.id,
                user.id,
            );

            res.status(200).json({
                data: contributors,
            });
        },
    );
}

export const projectController = new ProjectController();
