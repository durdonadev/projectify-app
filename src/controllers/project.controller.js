import { catchAsync } from "../utils/catch-async.js";
import { CustomError } from "../utils/custom-error.js";
import { projectService } from "../services/project.service.js";

class ProjectController {
    create = catchAsync(async (req, res) => {
        const { body, userId } = req;
        const input = {
            name: body.name,
            description: body.description
        };

        if (!input.name || !input.description) {
            throw new CustomError("Name and Description are required", 400);
        }

        const project = await projectService.create(input, userId);

        res.status(201).json({
            data: project
        });
    });

    getOne = catchAsync(async (req, res) => {
        const { userId, params } = req;

        const project = await projectService.getOne(params.id, userId);

        res.status(200).json({
            data: project
        });
    });

    update = catchAsync(async (req, res) => {
        const { body, params, userId } = req;
        const update = {};

        if (body.name) {
            update.name = body.name;
        }
        if (body.description) {
            update.description = body.description;
        }

        if (!update.name && !update.description) {
            throw new CustomError("No update data provided", 400);
        }

        await projectService.update(params.id, userId, update);
        res.status(204).send();
    });

    getAll = catchAsync(async (req, res) => {
        const { userId } = req;

        const projects = await projectService.getAll(userId);
        res.status(200).json({
            data: projects
        });
    });

    archive = catchAsync(async (req, res) => {
        const { params, userId } = req;

        await projectService.changeStatus(params.id, userId, "ARCHIVED");
        res.status(204).send();
    });

    reactivate = catchAsync(async (req, res) => {
        const { params, userId } = req;

        await projectService.changeStatus(params.id, userId, "ACTIVE");
        res.status(204).send();
    });
}

export const projectController = new ProjectController();
