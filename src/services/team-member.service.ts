import { Prisma, TeamMemberAccountStatus } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { crypto, mailer, bcrypt, CustomError } from '../utils';
import { AdminUpdateTeamMemberRequestBody, Roles } from '../types';

class TeamMemberService {
    create = async (data: Prisma.TeamMemberCreateInput) => {
        const inviteToken = crypto.createToken();
        const hashedInviteToken = crypto.hash(inviteToken);

        const teamMember = await prisma.teamMember.create({
            data: {
                ...data,
                inviteToken: hashedInviteToken,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                position: true,
                joinDate: true,
                email: true,
                status: true,
            },
        });

        await mailer.sendCreatePasswordInviteToTeamMember(
            data.email,
            inviteToken,
        );

        return teamMember;
    };

    delete = async (adminId: string, teamMemberId: string) => {
        const teamMember = await prisma.teamMember.findUnique({
            where: {
                id: teamMemberId,
            },
        });

        if (!teamMember) {
            throw new CustomError(
                `Team member does not exist with following id ${teamMemberId}`,
                404,
            );
        }

        if (teamMember.adminId !== adminId) {
            throw new CustomError(
                'Forbidden: You are not authorized to perform this action',
                403,
            );
        }

        if (
            teamMember.status === TeamMemberAccountStatus.ACTIVE ||
            teamMember.status === TeamMemberAccountStatus.DEACTIVATED
        ) {
            throw new CustomError(
                'Only users with INACTIVE status can be deleted!',
                400,
            );
        }

        await prisma.teamMember.delete({
            where: {
                id: teamMemberId,
            },
        });
    };

    createPassword = async (
        inviteToken: string,
        password: string,
        email: string,
    ) => {
        const hashedInviteToken = crypto.hash(inviteToken);
        const hashedPassword = await bcrypt.hash(password);

        const teamMember = await prisma.teamMember.findFirst({
            where: {
                inviteToken: hashedInviteToken,
            },
        });

        if (!teamMember) {
            throw new CustomError('Team member not found: Invalid Token', 404);
        }

        await prisma.teamMember.update({
            where: {
                email: email,
            },

            data: {
                password: hashedPassword,
                status: TeamMemberAccountStatus.ACTIVE,
                inviteToken: null,
            },
        });
    };

    getAll = async (adminId: string) => {
        const teamMembers = await prisma.teamMember.findMany({
            where: {
                adminId: adminId,
            },

            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                position: true,
                status: true,
                joinDate: true,
            },
        });

        return teamMembers;
    };

    changeStatus = async (
        adminId: string,
        teamMemberId: string,
        status: TeamMemberAccountStatus,
    ) => {
        const teamMember = await prisma.teamMember.findFirst({
            where: {
                id: teamMemberId,
            },
        });

        if (!teamMember) {
            throw new CustomError(
                `Team member does not exist with following id ${teamMemberId}`,
                404,
            );
        }

        if (teamMember.adminId !== adminId) {
            throw new CustomError(
                'Forbidden: You are not authorized to perform this action',
                403,
            );
        }

        if (teamMember.status === TeamMemberAccountStatus.INACTIVE) {
            throw new CustomError(
                'Status Change is now allowed. Users with INACTIVE status can be deleted only!',
                403,
            );
        }

        await prisma.teamMember.update({
            where: {
                id: teamMemberId,
                adminId: adminId,
            },

            data: {
                status: status,
            },
        });
    };

    update = async (
        adminId: string,
        teamMemberId: string,
        updateData: AdminUpdateTeamMemberRequestBody,
    ) => {
        await prisma.teamMember.update({
            where: {
                id: teamMemberId,
                adminId: adminId,
            },
            data: {
                ...updateData,
            },
        });
    };

    isTeamMemberBelongsToAdmin = async (id: string, adminId: string) => {
        const teamMember = await prisma.teamMember.findUnique({
            where: {
                id,
            },
        });

        if (!teamMember) {
            throw new CustomError('Team member does not exist', 404);
        }

        if (teamMember.adminId !== adminId) {
            throw new CustomError(
                'Forbidden: You are not authorized to perform this action',
                403,
            );
        }
    };

    login = async (email: string, password: string) => {
        const teamMember = await prisma.teamMember.findUnique({
            where: {
                email: email,
            },
            select: {
                id: true,
                status: true,
                password: true,
                adminId: true,
                firstName: true,
                lastName: true,
            },
        });

        if (!teamMember)
            throw new CustomError('Team member does not exist', 404);

        if (teamMember.status === TeamMemberAccountStatus.INACTIVE) {
            const inviteToken = crypto.createToken();
            const hashedInviteToken = crypto.hash(inviteToken);

            await prisma.teamMember.update({
                where: {
                    email,
                },
                data: {
                    inviteToken: hashedInviteToken,
                },
            });
            await mailer.sendCreatePasswordInviteToTeamMember(
                email,
                inviteToken,
            );

            throw new CustomError(
                'You did not set up the account password yet. We just emailed an instruction.',
                400,
            );
        }

        if (teamMember.status === TeamMemberAccountStatus.DEACTIVATED) {
            throw new CustomError(
                'Oops. You do not have an access to the platform anymore!',
                401,
            );
        }

        let isPasswordMatches = false;

        if (teamMember.password) {
            isPasswordMatches = await bcrypt.compare(
                password,
                teamMember.password as string,
            );
        }

        if (!isPasswordMatches) {
            throw new CustomError('Invalid Credentials', 401);
        }

        const token = jwt.sign(
            {
                id: teamMember.id,
                role: Roles.TEAM_MEMBER,
                belongsTo: teamMember.adminId,
            },
            process.env.JWT_SECRET as jwt.Secret,
            {
                expiresIn: '2 days',
            },
        );

        return token;
    };

    getMe = async (id: string) => {
        const teamMember = await prisma.teamMember.findUnique({
            where: {
                id,
            },
            select: {
                firstName: true,
                lastName: true,
                position: true,
                status: true,
                email: true,
                id: true,
                adminId: true,
                role: true,
            },
        });

        if (!teamMember) {
            throw new CustomError('Team member does not exist', 404);
        }

        return teamMember;
    };
}

export const teamMemberService = new TeamMemberService();
