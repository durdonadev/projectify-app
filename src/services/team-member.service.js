import jwt from "jsonwebtoken";
import { prisma } from "../prisma/index.js";
import { crypto } from "../utils/crypto.js";
import { mailer } from "../utils/mailer.js";
import { date } from "../utils/date.js";
import { CustomError } from "../utils/custom-error.js";
import { bcrypt } from "../utils/bcrypt.js";

class TeamMemberService {
    create = async (adminId, input) => {
        const inviteToken = crypto.createToken();
        const hashedInviteToken = crypto.hash(inviteToken);

        await prisma.teamMember.create({
            data: {
                ...input,
                adminId: adminId,
                inviteToken: hashedInviteToken
            }
        });

        await mailer.sendCreatePasswordInviteToTeamMember(
            input.email,
            inviteToken
        );
    };

    createPassword = async (inviteToken, password, email) => {
        const hashedInviteToken = crypto.hash(inviteToken);
        const hashedPassword = await bcrypt.hash(password);

        const teamMember = await prisma.teamMember.findFirst({
            where: {
                inviteToken: hashedInviteToken
            }
        });

        if (!teamMember) {
            throw new CustomError("Invalid Token", 400);
        }

        await prisma.teamMember.update({
            where: {
                email: email,
                inviteToken: hashedInviteToken
            },

            data: {
                password: hashedPassword,
                status: "ACTIVE",
                inviteToken: null
            }
        });
    };

    getAll = async (adminId) => {
        const teamMembers = await prisma.teamMember.findMany({
            where: {
                adminId: adminId
            },

            select: {
                id: true,
                firstName: true,
                lastName: true,
                position: true,
                createdAt: true
            }
        });

        return teamMembers;
    };

    changeStatus = async (adminId, teamMemberId, status) => {
        const teamMember = await prisma.teamMember.findFirst({
            where: {
                id: teamMemberId
            }
        });

        if (!teamMember) {
            throw new CustomError(
                `Team member does not exist with following id ${teamMemberId}`,
                404
            );
        }

        if (teamMember.adminId !== adminId) {
            throw new CustomError(
                "Forbidden: You are not authorized to perform this action",
                403
            );
        }

        await prisma.teamMember.update({
            where: {
                id: teamMemberId,
                adminId: adminId
            },

            data: {
                status: status
            }
        });
    };

    isTeamMemberBelongsToAdmin = async (id, adminId) => {
        const teamMember = await prisma.teamMember.findUnique({
            where: {
                id
            }
        });

        if (!teamMember) {
            throw new CustomError("Team member does not exist", 404);
        }

        if (teamMember.adminId !== adminId) {
            throw new CustomError(
                "Forbidden: You are not authorized to perform this action",
                403
            );
        }
    };

    login = async (email, password) => {
        const teamMember = await prisma.teamMember.findUnique({
            where: {
                email: email
            },
            select: {
                id: true,
                status: true,
                password: true,
                adminId: true
            }
        });

        if (!teamMember) throw new CustomError("User does not exist", 404);

        if (teamMember.status === "INACTIVE" && !teamMember.password) {
            const inviteToken = crypto.createToken();
            const hashedInviteToken = crypto.hash(inviteToken);

            await prisma.teamMember.update({
                where: {
                    email
                },
                data: {
                    inviteToken: hashedInviteToken
                }
            });
            await mailer.sendCreatePasswordInviteToTeamMember(
                email,
                inviteToken
            );

            throw new CustomError(
                "You did not set up the account password yet. We just emailed an instruction.",
                400
            );
        }

        if (teamMember.status === "INACTIVE" && teamMember.password) {
            throw new CustomError(
                "Your account has INACTIVE Status, can not log in",
                401
            );
        }

        const isPasswordMatches = await bcrypt.compare(
            password,
            teamMember.password
        );

        if (!isPasswordMatches) {
            throw new CustomError("Invalid Credentials", 401);
        }

        const projects = await prisma.teamMemberProject.findMany({
            where: {
                teamMemberId: teamMember.id,
                status: "ACTIVE"
            },
            select: {
                projectId: true
            }
        });

        const projectIds = projects.map((project) => project.projectId);

        const token = jwt.sign(
            {
                teamMember: {
                    id: teamMember.id,
                    adminId: teamMember.adminId,
                    projects: projectIds
                }
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "2 days"
            }
        );

        return token;
    };

    forgotPassword = async (email) => {
        const teamMember = await prisma.teamMember.findFirst({
            where: {
                email
            },
            select: {
                id: true
            }
        });

        if (!teamMember) {
            throw new CustomError(
                "Tean Member does not exist with provided email",
                404
            );
        }

        const passwordResetToken = crypto.createToken();
        const hashedPasswordResetToken = crypto.hash(passwordResetToken);

        await prisma.teamMember.update({
            where: {
                id: teamMember.id
            },
            data: {
                passwordResetToken: hashedPasswordResetToken,
                passwordResetTokenExpirationDate: date.addMinutes(10)
            }
        });

        await mailer.sendPasswordResetTokenTeamMember(
            email,
            passwordResetToken
        );
    };

    resetPassword = async (token, password) => {
        const hashedPasswordResetToken = crypto.hash(token);
        const teamMember = await prisma.teamMember.findFirst({
            where: {
                passwordResetToken: hashedPasswordResetToken
            },
            select: {
                id: true,
                passwordResetToken: true,
                passwordResetTokenExpirationDate: true
            }
        });

        if (!teamMember) {
            throw new CustomError(
                "Team-Member does not exist with provided Password Reset Token",
                404
            );
        }

        const currentTime = new Date();
        const tokenExpDate = new Date(
            teamMember.passwordResetTokenExpirationDate
        );

        if (tokenExpDate < currentTime) {
            // Token Expired;
            throw new CustomError(
                "Password Reset Token Expired: Request a new one",
                400
            );
        }

        await prisma.teamMember.update({
            where: {
                id: teamMember.id
            },
            data: {
                password: await bcrypt.hash(password),
                passwordResetToken: null,
                passwordResetTokenExpirationDate: null
            }
        });
    };
}

export const teamMemberService = new TeamMemberService();
