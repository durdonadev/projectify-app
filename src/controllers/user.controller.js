import { userService } from "../services/user.service.js";
import jwt from "jsonwebtoken";
import { catchAsync } from "../utils/catch-async.js";
import { CustomError } from "../utils/custom-error.js";

class UserController {
    signUp = catchAsync(async (req, res) => {
        const { body } = req;

        const input = {
            email: body.email,
            preferredFirstName: body.preferredFirstName,
            firstName: body.firstName,
            lastName: body.lastName,
            password: body.password
        };

        await userService.signUp(input);
        res.status(201).json({ message: "Success" });
    });

    login = catchAsync(async (req, res) => {
        const { body } = req;
        const input = {
            email: body.email,
            password: body.password
        };

        const jwt = await userService.login(input);
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

        await userService.activate(activationToken);

        res.status(200).json({
            message: "Success"
        });
    });

    forgotPassword = catchAsync(async (req, res) => {
        const {
            body: { email }
        } = req;

        await userService.forgotPassword(email);
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

        await userService.resetPassword(token, password);
        res.status(200).json({
            message: "Password successfully updated"
        });
    });

    getMe = catchAsync(async (req, res) => {
        const { userId } = req;

        const me = await userService.getMe(userId);

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
        const { userId, body } = req;

        const input = {
            title: body.title,
            description: body.description,
            due: body.due
        };

        if (!input.title || !input.due) {
            throw new CustomError("Title or Due date cannot be empty", 400);
        }

        const data = await userService.createTask(userId, input);

        res.status(201).json({
            data
        });
    });

    getTasks = catchAsync(async (req, res) => {
        const { userId } = req;

        const tasks = await userService.getTasks(userId);

        res.status(200).json({
            data: tasks
        });
    });

    getTask = async (req, res) => {
        const { userId, params } = req;
        try {
            const task = await userService.getTask(userId, params.taskId);

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
        const { userId, params } = req;

        await userService.deleteTask(userId, params.taskId);

        res.status(204).send();
    });

    updateTask = catchAsync(async (req, res) => {
        const { userId, params, body } = req;

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

        await userService.updateTask(userId, params.taskId, input);
        res.status(204).send();
    });
}

export const userController = new UserController();
