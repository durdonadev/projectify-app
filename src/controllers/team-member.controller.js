import { catchAsync } from "../utils/catch-async.js";
import { CustomError } from "../utils/custom-error.js";
import { teamMemberService } from "../services/team-member.service.js";

class TeamMemberController {
    create = catchAsync(async (req, res) => {
        const { body, adminId } = req;

        const input = {
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            position: body.position
        };

        if (
            !input.firstName ||
            !input.lastName ||
            !input.email ||
            !input.position
        ) {
            throw new CustomError(
                "All fields are required: First name, Last Name, Email, Position",
                400
            );
        }

        await teamMemberService.create(adminId, input);
        res.status(201).send({
            message: `Team member with ${input.email} has been created`
        });
    });

    createPassword = catchAsync(async (req, res) => {
        const {
            headers,
            body: { password, passwordConfirm, email }
        } = req;
        if (!headers.authorization) {
            throw new CustomError("You are not logged in. Please, log in", 401);
        }
        const [prefix, token] = headers.authorization.split(" ");

        if (!prefix || !token) {
            throw new CustomError("Not Valid Token", 400);
        }

        if (!token) {
            throw new CustomError("Invite Token is missing", 400);
        }

        if (!password || !passwordConfirm || !email) {
            throw new CustomError(
                "All fields are required: Password and Password Confirmation, Email",
                400
            );
        }

        if (password !== passwordConfirm) {
            throw new CustomError(
                "Password and Password Confirmation must match",
                400
            );
        }

        await teamMemberService.createPassword(token, password, email);

        res.status(200).json({
            message: "You successfully created a password. Now, you can log in"
        });
    });

    getAll = catchAsync(async (req, res) => {
        const { adminId } = req;
        const teamMembers = await teamMemberService.getAll(adminId);

        res.status(200).json({
            data: teamMembers
        });
    });

    deactivate = catchAsync(async (req, res) => {
        const { adminId, body } = req;
        await teamMemberService.changeStatus(
            adminId,
            body.teamMemberId,
            "INACTIVE"
        );

        res.status(204).send();
    });

    reactivate = catchAsync(async (req, res) => {
        const { adminId, body } = req;
        await teamMemberService.changeStatus(
            adminId,
            body.teamMemberId,
            "ACTIVE"
        );

        res.status(204).send();
    });

    login = catchAsync(async (req, res) => {
        const {
            body: { email, password }
        } = req;

        if (!email || !password) {
            throw new CustomError(
                "All fields required: email and password",
                400
            );
        }

        const jwt = await teamMemberService.login(email, password);
        res.status(200).json({
            token: jwt
        });
    });

    forgotPassword = catchAsync(async (req, res) => {
        const {
            body: { email }
        } = req;

        await teamMemberService.forgotPassword(email);
        res.status(200).json({
            message:
                "We emailed you an instruction to reset your password. Follow it!"
        });
    });

    resetPassword = catchAsync(async (req, res) => {
        const {
            body: { password, passwordConfirm },
            headers
        } = req;
        if (!password || !passwordConfirm) {
            throw new CustomError(
                "Password and Password Confirm is required",
                400
            );
        }

        if (password !== passwordConfirm) {
            throw new CustomError(
                "Password and Password Confirm does not match",
                400
            );
        }
        if (!headers.authorization) {
            throw new CustomError("Reset Token is missing", 400);
        }
        const [bearer, token] = headers.authorization.split(" ");
        if (bearer !== "Bearer" || !token) {
            throw new CustomError("Invalid Token", 400);
        }

        await teamMemberService.resetPassword(token, password);
        res.status(200).json({
            message: "Password successfully updated"
        });
    });

    getMe = catchAsync(async (req, res) => {
        const { teamMember } = req;
        const me = await teamMemberService.getMe(teamMember.id);

        res.status(200).json({
            data: me
        });
    });

    createTask = catchAsync(async (req, res) => {
        const { teamMember, body } = req;

        const input = {
            title: body.title,
            description: body.description,
            due: body.due
        };

        if (!input.title || !input.due) {
            throw new CustomError("Title or Due date cannot be empty", 400);
        }

        await teamMemberService.createTask(teamMember.id, input);

        res.status(201).send({
            message: `New Task: ${input.title} has been created`
        });
    });

    getTask = catchAsync(async (req, res) => {
        const { teamMember, params } = req;

        const task = await teamMemberService.getTask(
            teamMember.id,
            params.taskId
        );

        res.status(200).json({
            data: task
        });
    });
}

export const teamMemberController = new TeamMemberController();
