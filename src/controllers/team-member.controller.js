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
            data: `Team member with ${input.email} has been created`
        });
    });

    createPassword = catchAsync(async (req, res) => {
        const {
            query: { inviteToken },
            body: { password, passwordConfirm, email }
        } = req;

        if (!inviteToken) {
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

        await teamMemberService.createPassword(inviteToken, password, email);

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
}

export const teamMemberController = new TeamMemberController();
