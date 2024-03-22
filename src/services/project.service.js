import { prisma } from "../prisma/index.js";
import { CustomError } from "../utils/custom-error.js";
import { objectifyArr } from "../utils/mixed.js";
import { teamMemberService } from "./team-member.service.js";

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
                "Forbidden: You are not authorized to perform this action",
                403
            );
        }

        return project;
    };

    update = async (id, adminId, update) => {
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
                "Forbidden: You are not authorized to perform this action",
                403
            );
        }

        await prisma.project.update({
            where: {
                id: id
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

        const contributors = await Promise.all(
            projects.map((project) =>
                this.getContributorsByProjectId(project.id, "ACTIVE")
            )
        );

        const projectsWithNumberOfContributors = projects.map(
            (project, idx) => {
                return {
                    ...project,
                    numberOfContributors: contributors[idx].length
                };
            }
        );

        return projectsWithNumberOfContributors;
    };

    changeStatus = async (id, adminId, status) => {
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
                "Forbidden: You are not authorized to perform this action",
                403
            );
        }

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

    addContributor = async (projectId, teamMemberId, adminId) => {
        await this.isProjectBelongsToAdmin(projectId, adminId);
        await teamMemberService.isTeamMemberBelongsToAdmin(
            teamMemberId,
            adminId
        );
        const data = await prisma.contributor.create({
            data: { projectId, teamMemberId },
            select: {
                status: true,
                joinedAt: true,
                teamMemberId: true
            }
        });

        return data;
    };

    changeContributorStatus = async (
        projectId,
        teamMemberId,
        adminId,
        status
    ) => {
        await this.isProjectBelongsToAdmin(projectId, adminId);
        await teamMemberService.isTeamMemberBelongsToAdmin(
            teamMemberId,
            adminId
        );
        await prisma.contributor.updateMany({
            where: {
                projectId,
                teamMemberId
            },
            data: {
                status
            }
        });
    };

    getContributors = async (projectId, adminId) => {
        await this.isProjectBelongsToAdmin(projectId, adminId);
        const teamMembers = await prisma.teamMember.findMany({
            where: {
                adminId
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                position: true
            }
        });

        const contributors = await this.getContributorsByProjectId(projectId);

        const teamMembersObj = objectifyArr(teamMembers, "id");

        const contributorsWithDetails = contributors.map((contributor) => {
            return {
                ...teamMembersObj[contributor.teamMemberId],
                status: contributor.status,
                joinedAt: contributor.joinedAt
            };
        });

        const contributorsObj = objectifyArr(contributors, "teamMemberId");

        const notAssignedContributors = teamMembers.filter(
            (teamMember) => !contributorsObj[teamMember.id]
        );

        return {
            assignedContributors: contributorsWithDetails,
            notAssignedContributors: notAssignedContributors
        };
    };

    isProjectBelongsToAdmin = async (id, adminId) => {
        const project = await prisma.project.findUnique({
            where: {
                id
            }
        });

        if (!project) {
            throw new CustomError("Project does not exist", 404);
        }
        if (project.adminId !== adminId) {
            throw new CustomError(
                "Forbidden: You are not authorized to perform this action",
                404
            );
        }
    };

    getContributorsByProjectId = async (id, status) => {
        const where = {
            projectId: id
        };

        if (status) {
            where.status = status;
        }

        const contributors = await prisma.contributor.findMany({
            where: {
                ...where
            },

            select: {
                teamMemberId: true,
                status: true,
                joinedAt: true
            }
        });

        return contributors;
    };
}

export const projectService = new ProjectService();
