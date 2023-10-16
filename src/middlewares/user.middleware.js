import jwt from "jsonwebtoken";
class UserMiddleware {
    authenticate = (req, res, next) => {
        const { headers } = req;
        if (!headers.authorization) {
            res.status(401).json({
                message: "You are not logged in. Please, log in"
            });
            return;
        }
        const [prefix, token] = headers.authorization.split(" ");

        if (!prefix || !token) {
            res.status(400).json({
                message: "Not Valid Token"
            });

            return;
        }

        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);

            req.userId = payload.userId;
            next();
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    };
}

export const userMiddleware = new UserMiddleware();
