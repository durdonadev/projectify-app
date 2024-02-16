import jwt from "jsonwebtoken";
import { prisma } from "../prisma/index.js";
import { crypto } from "../utils/crypto.js";
import { mailer } from "../utils/mailer.js";
import { date } from "../utils/date.js";
import { CustomError } from "../utils/custom-error.js";
import { bcrypt } from "../utils/bcrypt.js";
import { v4 as uuid } from "uuid";

class TeamMemberService {
    create = async (adminId, input) => {
        const inviteToken = crypto.createToken();
        const hashedInviteToken = crypto.hash(inviteToken);

        const teamMember = await prisma.teamMember.create({
            data: {
                ...input,
                adminId: adminId,
                inviteToken: hashedInviteToken
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                position: true,
                joinDate: true,
                email: true,
                status: true
            }
        });

        await mailer.sendCreatePasswordInviteToTeamMember(
            input.email,
            inviteToken
        );

        return teamMember;
    };

    delete = async (adminId, teamMemberId) => {
        const teamMember = await prisma.teamMember.findUnique({
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

        if (
            teamMember.status === "ACTIVE" ||
            teamMember.status === "DEACTIVATED"
        ) {
            throw new CustomError(
                "Only users with INACTIVE status can be deleted!",
                404
            );
        }

        await prisma.teamMember.delete({
            where: {
                id: teamMemberId
            }
        });
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
                email: true,
                position: true,
                status: true,
                joinDate: true
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

        if (teamMember.status === "INACTIVE") {
            throw new CustomError(
                "Status Change is now allowed. Users with INACTIVE status can be deleted only!",
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

    update = async (id, adminId, update) => {
        const teamMember = await prisma.teamMember.findUnique({
            where: {
                id: id
            }
        });

        if (!teamMember) {
            throw new CustomError("Team Member does not exist", 404);
        }

        if (teamMember.adminId !== adminId) {
            throw new CustomError(
                "Forbidden: You are not authorized to perform this action",
                403
            );
        }

        await prisma.teamMember.update({
            where: {
                id: id
            },
            data: {
                ...update
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

    getMe = async (id) => {
        const teamMember = await prisma.teamMember.findUnique({
            where: {
                id
            },
            select: {
                firstName: true,
                lastName: true,
                position: true,
                status: true,
                email: true,
                id: true,
                adminId: true
            }
        });

        if (!teamMember) {
            throw new CustomError("Team member does not exist", 404);
        }

        return { ...teamMember, role: "teamMember" };
    };

    changePassword = async (teamMemberId, input) => {
        const { password, newPassword } = input;

        const teamMember = await prisma.teamMember.findUnique({
            where: {
                id: teamMemberId
            },
            select: {
                password: true
            }
        });

        if (!teamMember) {
            throw new CustomError("Team member not found", 404);
        }

        const passwordMatch = await bcrypt.compare(
            password,
            teamMember.password
        );

        if (!passwordMatch) {
            throw new CustomError("Invalid Credentials", 400);
        }

        const hashedPassword = await bcrypt.hash(newPassword);
        await prisma.teamMember.update({
            where: {
                id: teamMemberId
            },
            data: {
                password: hashedPassword
            }
        });
    };

    createTask = async (teamMemberId, input) => {
        const id = uuid();
        const task = {
            ...input,
            status: "TODO",
            id
        };

        await prisma.teamMember.update({
            where: {
                id: teamMemberId
            },
            data: {
                tasks: {
                    push: task
                }
            }
        });

        return task;
    };

    getTask = async (teamMemberId, taskId) => {
        const teamMember = await prisma.teamMember.findUnique({
            where: {
                id: teamMemberId
            },

            select: {
                tasks: true
            }
        });

        const task = teamMember.tasks.find((task) => task.id === taskId);
        if (!task) {
            throw new CustomError("Task not found", 404);
        }

        return task;
    };

    getTasks = async (teamMemberId) => {
        const tasks = await prisma.teamMember.findUnique({
            where: {
                id: teamMemberId
            },

            select: {
                tasks: true
            }
        });

        return tasks;
    };

    updateTask = async (teamMemberId, taskId, input) => {
        const teamMember = await prisma.teamMember.findUnique({
            where: {
                id: teamMemberId
            },

            select: {
                tasks: true
            }
        });

        const tasksNotToUpdate = [];
        let taskToUpdate = null;

        teamMember.tasks.forEach((task) => {
            if (task.id === taskId) {
                taskToUpdate = task;
            } else {
                tasksNotToUpdate.push(task);
            }
        });

        if (!taskToUpdate) {
            throw new CustomError("Task does not exist", 404);
        }

        const updatedTask = {
            ...taskToUpdate,
            ...input
        };

        await prisma.teamMember.update({
            where: {
                id: teamMemberId
            },

            data: {
                tasks: [...tasksNotToUpdate, updatedTask]
            }
        });
    };

    deleteTask = async (teamMemberId, taskId) => {
        const teamMember = await prisma.teamMember.findUnique({
            where: {
                id: teamMemberId
            },

            select: {
                tasks: true
            }
        });

        const tasksToKeep = teamMember.tasks.filter(
            (task) => task.id !== taskId
        );

        if (tasksToKeep.length === teamMember.tasks.length) {
            throw new CustomError("Task does not exist", 404);
        }

        await prisma.teamMember.update({
            where: {
                id: teamMemberId
            },

            data: {
                tasks: tasksToKeep
            }
        });
    };
}

export const teamMemberService = new TeamMemberService();
