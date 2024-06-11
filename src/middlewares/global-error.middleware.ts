import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js';
import { NextFunction, Response } from 'express';

import { CustomError } from '../utils';

export class GlobalError {
    static handle(
        err: CustomError | PrismaClientKnownRequestError,
        req: Request,
        res: Response,
    ) {
        const success = false;
        let statusCode = 500;
        let message = err.message;
        let isOperational = false;

        if (err instanceof CustomError && err.isOperational) {
            statusCode = err.statusCode;
            isOperational = true;
        }

        if (err instanceof PrismaClientKnownRequestError) {
            if (err.code === 'P2002') {
                statusCode = 409;
                message = 'Resource already exists';
                isOperational = true;
            }
        }

        res.status(statusCode).json({
            message,
            isOperational,
            success,
        });
    }
}
