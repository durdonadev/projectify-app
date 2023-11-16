import { adminService } from "../services/admin.service.js";
import jwt from "jsonwebtoken";
import { catchAsync } from "../utils/catch-async.js";
import { CustomError } from "../utils/custom-error.js";

class AdminController {
    signUp = catchAsync(async (req, res) => {
        const { body } = req;

        const adminInput = {
            email: body.email,
            preferredFirstName: body.preferredName,
            firstName: body.firstName,
            lastName: body.lastName,
            password: body.password
        };

        const companyInput = {
            name: body.company.name,
            position: body.company.position
        };

        await adminService.signUp(adminInput, companyInput);
        res.status(201).json({
            message: "Success"
        });
    });

    login = catchAsync(async (req, res) => {
        const { body } = req;
        const input = {
            email: body.email,
            password: body.password
        };

        const jwt = await adminService.login(input);
        res.status(200).json({
            token: jwt
        });
    });

    activate = catchAsync(async (req, res) => {
        const {
            query: { activationToken }
        } = req;

        if (!activationToken) {
            throw new CustomError("Activation Token is missing", 400);
        }

        await adminService.activate(activationToken);

        res.status(200).json({
            message: "Success"
        });
    });

    forgotPassword = catchAsync(async (req, res) => {
        const {
            body: { email }
        } = req;

        await adminService.forgotPassword(email);
        res.status(200).json({
            message: "Password reset email has been sent"
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

        await adminService.resetPassword(token, password);
        res.status(200).json({
            message: "Password successfully updated"
        });
    });

    getMe = catchAsync(async (req, res) => {
        const { adminId } = req;

        const me = await adminService.getMe(adminId);

        res.status(200).json({
            data: me
        });
    });

    logout = async (req, res) => {
        res.status(200).send({
            token: ""
        });
    };

    createTask = catchAsync(async (req, res) => {
        const { adminId, body } = req;

        const input = {
            title: body.title,
            description: body.description,
            due: body.due
        };

        if (!input.title || !input.due) {
            throw new CustomError("Title or Due date cannot be empty", 400);
        }

        const data = await adminService.createTask(adminId, input);

        res.status(201).json({
            data
        });
    });

    getTasks = catchAsync(async (req, res) => {
        const { adminId } = req;

        if (!adminId) {
            throw new CustomError(
                "Forbidden: You are not authorized to perform this action",
                403
            );
        }

        const tasks = await adminService.getTasks(adminId);

        res.status(200).json({
            data: tasks
        });
    });

    getTask = async (req, res) => {
        const { adminId, params } = req;
        try {
            const task = await adminService.getTask(adminId, params.taskId);

            res.status(200).json({
                data: task
            });
        } catch (error) {
            let status = 500;
            if (error.message === "Task not found") {
                status = 404;
            }
            res.status(status).json({
                message: error.message
            });
        }
    };

    deleteTask = catchAsync(async (req, res) => {
        const { adminId, params } = req;

        await adminService.deleteTask(adminId, params.taskId);

        res.status(204).send();
    });

    updateTask = catchAsync(async (req, res) => {
        const { adminId, params, body } = req;

        const input = {};
        if (body.status) {
            input.status = body.status;
        }
        if (body.title) {
            input.title = body.title;
        }
        if (body.description) {
            input.description = body.description;
        }

        if (!Object.keys(input).length) {
            res.status(400).json({
                message: "Update data not provided"
            });

            return;
        }

        await adminService.updateTask(adminId, params.taskId, input);
        res.status(204).send();
    });
}

export const adminController = new AdminController();
