import { prisma } from "../prisma/index.js";
import { projectService } from "./project.service.js";
import { CustomError } from "../utils/custom-error.js";
import { v4 as uuid } from "uuid";

class StoryService {
    create = async (input) => {
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

    update = async (id, update) => {
        await prisma.story.update({
            where: {
                id: id
            },
            data: {
                ...update
            }
        });
    };

    changeStatus = async (id, status) => {
        await prisma.story.updateMany({
            where: {
                id: id
            },

            data: {
                status: status
            }
        });
    };

    createSubTask = async (storyId, input) => {
        const id = uuid();
        const subTask = {
            ...input,
            id: id,
            status: "TODO"
        };

        await prisma.story.update({
            where: {
                id: storyId
            },
            data: {
                subTasks: {
                    push: subTask
                }
            }
        });
        return subTask;
    };

    getSubTask = async (story, subTaskId) => {
        const subTask = story.subTasks.find((subTask) => {
            return subTask.id === subTaskId;
        });

        return subTask;
    };
}

export const storyService = new StoryService();
