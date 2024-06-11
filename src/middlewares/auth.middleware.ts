import jwt from 'jsonwebtoken';
import { NextFunction, Request } from 'express';
import { CustomError } from '../utils';
import { RequestUser, Roles } from '../types';

class AuthMiddleware {
    authenticate = (req: Request, _, next: NextFunction) => {
        const { headers } = req;
        if (!headers.authorization) {
            throw new CustomError('You are not logged in. Please, log in', 401);
        }
        const [prefix, token] = headers.authorization.split(' ');

        if (!prefix || !token) {
            throw new CustomError('Not Valid Token', 400);
        }

        try {
            const payload = jwt.verify(
                token,
                process.env.JWT_SECRET as jwt.Secret,
            ) as RequestUser;

            req.locals.user = payload;
            next();
        } catch (error) {
            throw new CustomError(error.message, 500);
        }
    };

    isAdmin = (req: Request, _, next: NextFunction) => {
        const { locals } = req;

        if (locals.user.role !== Roles.ADMIN) {
            throw new CustomError(
                'Forbidden: You are not authorized to perform this action',
                403,
            );
        }

        next();
    };

    isTeamMember = (req: Request, _, next: NextFunction) => {
        const { locals } = req;

        if (locals.user.role !== Roles.TEAM_MEMBER) {
            throw new CustomError(
                'Forbidden: You are not authorized to perform this action',
                403,
            );
        }

        next();
    };
}

export const authMiddleware = new AuthMiddleware();
