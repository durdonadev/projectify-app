import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library.js";

export class GlobalError {
    static handle(err, req, res, next) {
        const success = false;
        let statusCode = 500;
        let message = err.message;
        let isOperational = false;

        if (err.isOperational) {
            statusCode = err.statusCode;
            isOperational = true;
        }

        if (err instanceof PrismaClientKnownRequestError) {
            if (err.code === "P2002") {
                statusCode = 409;
                message = "Resource already exists";
                isOperational = true;
            }
        }

        res.status(statusCode).json({
            message,
            isOperational,
            success
        });
    }
}
