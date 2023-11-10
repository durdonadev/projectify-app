import { prisma } from "../prisma/index.js";
import { CustomError } from "../utils/custom-error.js";

class ProjectService {
    create = async (input, adminId) => {
        const project = await prisma.project.create({
            data: {
                ...input,
                adminId: adminId
            }
        });

        return project;
    };

    getOne = async (id, adminId) => {
        const project = await prisma.project.findUnique({
            where: {
                id: id
            }
        });

        if (!project) {
            throw new CustomError("Project does not exist", 404);
        }

        if (project.adminId !== adminId) {
            throw new CustomError(
                "Forbidden: This project does not belong to you!",
                403
            );
        }

        return project;
    };

    update = async (id, adminId, update) => {
        await prisma.project.update({
            where: {
                id: id,
                adminId: adminId
            },
            data: {
                ...update
            }
        });
    };

    getAll = async (adminId) => {
        const projects = await prisma.project.findMany({
            where: {
                adminId: adminId
            }
        });

        return projects;
    };

    changeStatus = async (id, adminId, status) => {
        await prisma.project.update({
            where: {
                id: id,
                adminId: adminId
            },

            data: {
                status: status
            }
        });
    };
}

export const projectService = new ProjectService();
