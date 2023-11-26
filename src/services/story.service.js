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
}

export const storyService = new StoryService();
