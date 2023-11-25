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

    getOne = async (storyId, input, adminId) => {
        await projectService.isProjectBelongsToAdmin(input.projectId, adminId);

        await this.isStoryAssignedToTeamMember(storyId, input.assigneeId);

        const story = await prisma.story.findUnique({
            where: {
                id: storyId
            }
        });

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

    // isStoryBelongsToProject = async (storyId, projectId) => {
    //     const story = await prisma.story.findUnique({
    //         where: {
    //             id: storyId
    //         },
    //         select: {
    //             id: true,
    //             projectId: true
    //         }
    //     });

    //     if (!story) {
    //         throw new CustomError("Story does not exist", 404);
    //     }
    //     if (story.projectId !== projectId) {
    //         throw new CustomError(
    //             "Forbidden: You are not authorized to perform this action",
    //             404
    //         );
    //     }
    // };

    isStoryAssignedToTeamMember = async (storyId, assigneeId) => {
        const story = await prisma.story.findUnique({
            where: {
                id: storyId
            },
            select: {
                id: true,
                assigneeId: true
            }
        });

        if (!story) {
            throw new CustomError("Story does not exist", 404);
        }
        if (story.assigneeId !== assigneeId) {
            throw new CustomError(
                "Forbidden: You are not authorized to perform this action",
                404
            );
        }
    };
}

export const storyService = new StoryService();
