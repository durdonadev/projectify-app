import { ContributorStatus, Prisma, ProjectStatus } from '@prisma/client';
import { prisma } from '../prisma';
import { CustomError, objectifyArr } from '../utils';
import { teamMemberService } from './team-member.service';

class ProjectService {
    create = async (data: Prisma.ProjectCreateInput) => {
        const project = await prisma.project.create({
            data,
        });

        return project;
    };

    getOne = async (id: string, adminId: string) => {
        const project = await prisma.project.findUnique({
            where: {
                id: id,
            },
        });

        if (!project) {
            throw new CustomError('Project does not exist', 404);
        }

        if (project.adminId !== adminId) {
            throw new CustomError(
                'Forbidden: You are not authorized to perform this action',
                403,
            );
        }

        return project;
    };

    update = async (
        id: string,
        adminId: string,
        update: Prisma.ProjectUpdateInput,
    ) => {
        const project = await prisma.project.findUnique({
            where: {
                id: id,
            },
        });

        if (!project) {
            throw new CustomError('Project does not exist', 404);
        }

        if (project.adminId !== adminId) {
            throw new CustomError(
                'Forbidden: You are not authorized to perform this action',
                403,
            );
        }

        await prisma.project.update({
            where: {
                id: id,
            },
            data: {
                ...update,
            },
        });
    };

    getAll = async (adminId: string) => {
        const projects = await prisma.project.findMany({
            where: {
                adminId: adminId,
            },
        });

        const contributors = await Promise.all(
            projects.map((project) =>
                this.getContributorsByProjectIdAndStatus(
                    project.id,
                    ContributorStatus.ACTIVE,
                ),
            ),
        );

        const projectsWithNumberOfContributors = projects.map(
            (project, idx) => {
                return {
                    ...project,
                    numberOfContributors: contributors[idx].length,
                };
            },
        );

        return projectsWithNumberOfContributors;
    };

    changeStatus = async (
        id: string,
        adminId: string,
        status: ProjectStatus,
    ) => {
        const project = await prisma.project.findUnique({
            where: {
                id: id,
            },
        });

        if (!project) {
            throw new CustomError('Project does not exist', 404);
        }

        if (project.adminId !== adminId) {
            throw new CustomError(
                'Forbidden: You are not authorized to perform this action',
                403,
            );
        }
        await prisma.project.update({
            where: {
                id: id,
                adminId: adminId,
            },

            data: {
                status: status,
            },
        });
    };

    addContributor = async (
        projectId: string,
        teamMemberId: string,
        adminId: string,
    ) => {
        await this.isProjectBelongsToAdmin(projectId, adminId);
        await teamMemberService.isTeamMemberBelongsToAdmin(
            teamMemberId,
            adminId,
        );
        const data = await prisma.contributor.create({
            data: { projectId, teamMemberId },
            select: {
                status: true,
                joinedAt: true,
                teamMemberId: true,
            },
        });

        return data;
    };

    changeContributorStatus = async (
        projectId: string,
        teamMemberId: string,
        adminId: string,
        status: ContributorStatus,
    ) => {
        await this.isProjectBelongsToAdmin(projectId, adminId);
        await teamMemberService.isTeamMemberBelongsToAdmin(
            teamMemberId,
            adminId,
        );
        await prisma.contributor.updateMany({
            where: {
                projectId,
                teamMemberId,
            },
            data: {
                status,
            },
        });
    };

    getContributors = async (projectId: string, adminId: string) => {
        await this.isProjectBelongsToAdmin(projectId, adminId);
        const teamMembers = await prisma.teamMember.findMany({
            where: {
                adminId,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                position: true,
            },
        });

        const contributors =
            await this.getContributorsByProjectIdAndStatus(projectId);

        const teamMembersObj = objectifyArr(teamMembers, 'id');

        const contributorsWithDetails = contributors.map((contributor) => {
            return {
                ...teamMembersObj[contributor.teamMemberId],
                status: contributor.status,
                joinedAt: contributor.joinedAt,
            };
        });

        const contributorsObj = objectifyArr(contributors, 'teamMemberId');

        const notAssignedContributors = teamMembers.filter(
            (teamMember) => !contributorsObj[teamMember.id],
        );

        return {
            assignedContributors: contributorsWithDetails,
            notAssignedContributors: notAssignedContributors,
        };
    };

    private isProjectBelongsToAdmin = async (id: string, adminId: string) => {
        const project = await prisma.project.findUnique({
            where: {
                id,
            },
        });

        if (!project) {
            throw new CustomError('Project does not exist', 404);
        }
        if (project.adminId !== adminId) {
            throw new CustomError(
                'Forbidden: You are not authorized to perform this action',
                403,
            );
        }
    };

    private getContributorsByProjectIdAndStatus = async (
        id: string,
        contributorStatus?: ContributorStatus,
    ) => {
        const where: Prisma.ContributorWhereInput = {
            projectId: id,
        };

        if (contributorStatus) {
            where.status = contributorStatus;
        }

        const contributors = await prisma.contributor.findMany({
            where: {
                ...where,
            },

            select: {
                teamMemberId: true,
                status: true,
                joinedAt: true,
            },
        });

        return contributors;
    };
}

export const projectService = new ProjectService();
