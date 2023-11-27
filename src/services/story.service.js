import { prisma } from "../prisma/index.js";
import { projectService } from "./project.service.js";
import { CustomError } from "../utils/custom-error.js";

class StoryService {
    create = async (input, adminId) => {
        await projectService.isProjectBelongsToAdmin(input.projectId, adminId);
        const story = await prisma.story.create({
            data: input
        });

        return story;
    };

    getOne = async (id) => {
        const story = await prisma.story.findUnique({
            where: {
                id: id
            }
        });
        if (!story) {
            throw new CustomError("Story does not exist", 404);
        }
        return story;
    };

    getAll = async (projectId, adminId) => {
        await projectService.isProjectBelongsToAdmin(projectId, adminId);

        const stories = await prisma.story.findMany({
            where: {
                projectId: projectId
            }
        });

        return stories;
    };

    update = async (id, assigneeId, update) => {
        await prisma.story.update({
            where: {
                id: id,
                assigneeId: assigneeId
            },
            data: {
                ...update
            }
        });
    };

    changeStatus = async (id, adminId, status) => {
        const story = await prisma.story.findUnique({
            where: {
                id: id
            }
        });
        if (!story) {
            throw new CustomError("Story does not exist", 404);
        }

        const { projectId } = story;

        await projectService.isProjectBelongsToAdmin(projectId, adminId);

        const project = await prisma.project.findUnique({
            where: {
                id: projectId
            }
        });

        if (project.adminId !== adminId) {
            throw new CustomError(
                "Forbidden: You are not authorized to perform this action",
                403
            );
        }

        await prisma.story.updateMany({
            where: {
                id: id
            },

            data: {
                status: status
            }
        });
    };
}

export const storyService = new StoryService();
