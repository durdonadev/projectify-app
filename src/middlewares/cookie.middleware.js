import signature from "cookie-signature";

export class CookieMiddleware {
    static verify = (req, res, next) => {
        const { cookies } = req;
        if (!cookies.sessionId) {
            res.status(401).json({
                message: "You are not logged in"
            });
            return;
        }

        const sessionId = signature.unsign(
            cookies.sessionId.slice(2),
            process.env.COOKIE_SECRET
        );
        if (!sessionId) {
            res.status(401).json({
                message: "Invalid Credentials"
            });
            return;
        }

        req.sessionId = sessionId;
        next();
    };
}
