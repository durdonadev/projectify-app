import { prisma } from "../prisma/index.js";
import { CustomError } from "../utils/custom-error.js";

class ProjectService {
    create = async (input, userId) => {
        const project = await prisma.project.create({
            data: {
                ...input,
                userId: userId
            }
        });

        return project;
    };

    getOne = async (id, userId) => {
        const project = await prisma.project.findUnique({
            where: {
                id: id
            }
        });

        if (!project) {
            throw new CustomError("Project does not exist", 404);
        }

        if (project.userId !== userId) {
            throw new CustomError(
                "Forbidden: This project does not belong to you!",
                403
            );
        }

        return project;
    };

    update = async (id, userId, update) => {
        await prisma.project.update({
            where: {
                id: id,
                userId: userId
            },
            data: {
                ...update
            }
        });
    };

    getAll = async (userId) => {
        const projects = await prisma.project.findMany({
            where: {
                userId: userId
            }
        });

        return projects;
    };

    changeStatus = async (id, userId, status) => {
        await prisma.project.update({
            where: {
                id: id,
                userId: userId
            },

            data: {
                status: status
            }
        });
    };
}

export const projectService = new ProjectService();
