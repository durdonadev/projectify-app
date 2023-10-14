import { userService } from "../services/user.service.js";
import signature from "cookie-signature";

class UserController {
    signUp = async (req, res) => {
        const { body } = req;

        const input = {
            email: body.email,
            preferredFirstName: body.preferredFirstName,
            firstName: body.firstName,
            lastName: body.lastName,
            password: body.password
        };

        try {
            await userService.signUp(input);
            res.status(201).json({ message: "Success" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };

    login = async (req, res) => {
        const { body } = req;
        const input = {
            email: body.email,
            password: body.password
        };

        try {
            const sessionId = await userService.login(input);
            const signedSessionId =
                "s:" + signature.sign(sessionId, process.env.COOKIE_SECRET);
            console.log(signedSessionId);
            console.log(sessionId);

            res.cookie("sessionId", signedSessionId, {
                maxAge: 10000,
                httpOnly: true,
                secure: true
            });
            res.send();
        } catch (error) {
            let statusCode = 500;
            if (error.message === "Invalid Credentials") {
                statusCode = 401;
            }
            res.status(statusCode).json({
                message: error.message
            });
        }
    };

    activate = async (req, res) => {
        const {
            query: { activationToken }
        } = req;

        if (!activationToken) {
            res.status(400).json({
                message: "Activation Token is missing"
            });
            return;
        }

        try {
            await userService.activate(activationToken);

            res.status(200).json({
                message: "Success"
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: error.message
            });
        }
    };

    forgotPassword = async (req, res) => {
        const {
            body: { email }
        } = req;

        try {
            await userService.forgotPassword(email);
            res.status(200).json({
                message: "Password reset email has been sent"
            });
        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    };

    resetPassword = async (req, res) => {
        const {
            body: { password, passwordConfirm },
            headers
        } = req;
        if (!password || !passwordConfirm) {
            res.status(400).json({
                message: "Password and Password Confirm is required"
            });
            return;
        }

        if (password !== passwordConfirm) {
            res.status(400).json({
                message: "Password and Password Confirm does not match"
            });
            return;
        }
        if (!headers.authorization) {
            res.status(400).json({
                message: "Reset Token is missing"
            });
        }
        const [bearer, token] = headers.authorization.split(" ");
        if (bearer !== "Bearer" || !token) {
            res.status(400).json({
                message: "Invalid Token"
            });
        }

        try {
            await userService.resetPassword(token, password);
            res.status(200).json({
                message: "Password successfully updated"
            });
        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    };

    getMe = async (req, res) => {
        const { sessionId } = req;
        try {
            const me = await userService.getMe(sessionId);

            res.status(200).json({
                data: me
            });
        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    };

    logout = async (req, res) => {
        const { sessionId } = req;
        try {
            await userService.logout(sessionId);

            res.status(204).send();
        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    };

    update = async (req, res) => {
        const allowedFields = ["firstName", "lastName", "bio"];
        const { body, params } = req;

        const input = {};
        allowedFields.forEach((field) => {
            if (body[field]) {
                input[field] = body[field];
            }
        });

        try {
            await userService.update(input, params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({
                message: error
            });
        }
    };
}

export const userController = new UserController();
