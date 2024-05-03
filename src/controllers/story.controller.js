import { catchAsync } from "../utils/catch-async.js";
import { CustomError } from "../utils/custom-error.js";
import { storyService } from "../services/story.service.js";

class StoryController {
    create = catchAsync(async (req, res) => {
        const {
            body: { title, description, point, due, assigneeId, projectId },
            adminId
        } = req;

        if (!title || !projectId) {
            throw new CustomError("Title and Project ID are required!", 400);
        }

        const input = {
            title,
            description,
            point,
            due,
            assigneeId,
            projectId
        };

        const story = await storyService.create(input, adminId);
        res.status(200).json({
            data: story
        });
    });

    getOne = catchAsync(async (req, res) => {
        const { params } = req;

        const story = await storyService.getOne(params.storyId);

        res.status(200).json({
            data: story
        });
    });

    getAll = catchAsync(async (req, res) => {
        const { params, adminId } = req;

        const stories = await storyService.getAll(params.projectId, adminId);
        res.status(200).json({
            data: stories
        });
    });

    update = catchAsync(async (req, res) => {
        const { body, params } = req;
        const update = {};

        if (body.title) {
            update.title = body.title;
        }
        if (body.description) {
            update.description = body.description;
        }
        if (body.point) {
            update.point = body.point;
        }
        if (body.due) {
            update.due = body.due;
        }
        if (
            !update.title &&
            !update.description &&
            !update.point &&
            !update.due
        ) {
            throw new CustomError("No update data provided", 400);
        }

        await storyService.update(params.id, update);
        res.status(204).send();
    });

    archive = catchAsync(async (req, res) => {
        const { params } = req;

        await storyService.changeStatus(params.id, "ARCHIVED");
        res.status(204).send();
    });

    deleteOne = catchAsync(async (req, res) => {
        const { params } = req;

        await storyService.deleteOne(params.storyId);

        res.status(204).send();
    });

    createSubTask = catchAsync(async (req, res) => {
        const {
            params: { storyId },
            body: { title, description, due }
        } = req;

        const input = {
            title,
            description,
            due
        };

        if (!input.title || !input.due) {
            throw new CustomError("Title or Due date cannot be empty", 401);
        }

        const subTask = await storyService.createSubTask(storyId, input);

        res.status(200).json({
            data: subTask
        });
    });

    getSubTask = catchAsync(async (req, res) => {
        const {
            story,
            params: { subTaskId }
        } = req;

        const subTask = await storyService.getSubTask(story, subTaskId);

        res.status(200).json({
            data: subTask
        });
    });

    getAllSubTasks = catchAsync(async (req, res) => {
        const { story } = req;

        const subTasks = await storyService.getAllSubTasks(story);

        res.status(200).json({
            data: subTasks
        });
    });

    updateSubTask = catchAsync(async (req, res) => {
        const {
            story,
            params: { subTaskId },
            body: { title, description, due }
        } = req;

        const input = {};
        if (title) {
            input.title = title;
        }

        if (description) {
            input.description = description;
        }

        if (due) {
            input.due = due;
        }

        if (!Object.keys(input).length) {
            throw new CustomError("No update data provided", 400);
        }

        await storyService.updateSubTask(story, subTaskId, input);

        res.status(204).send();
    });

    deleteSubTask = catchAsync(async (req, res) => {
        const {
            story,
            params: { subTaskId }
        } = req;

        await storyService.deleteSubTask(story, subTaskId);

        res.status(204).send();
    });
}

export const storyController = new StoryController();
