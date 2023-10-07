import { userService } from "../services/user.service.js";

class UserController {
    signUp = async (req, res) => {
        const { body } = req;

        const input = {
            email: body.email,
            preferredFirstName: body.preferredFirstName,
            firstName: body.firstName,
            lastName: body.lastName,
            password: body.password,
            bio: body.bio
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
            await userService.login(input);

            res.status(200).json({
                message: "Success"
            });
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
