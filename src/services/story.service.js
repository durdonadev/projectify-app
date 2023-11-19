import { prisma } from "../prisma/index.js";
import { projectService } from "./project.service.js";
// import { CustomError } from "../utils/custom.error.js";

class StoryService {
    create = async (input, adminId) => {
        await projectService.isProjectBelongsToAdmin(input.projectId, adminId);
        const story = await prisma.story.create({
            data: input
        });

        return story;
    };
}

export const storyService = new StoryService();
