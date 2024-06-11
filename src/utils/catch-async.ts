import { NextFunction } from "express";

export const catchAsync = (
    routeHandler: (
        req: Request,
        res: Response,
        next: NextFunction
    ) => Promise<void> | void
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await routeHandler(req, res, next);
        } catch (error) {
            console.log(error);
            next(error);
        }
    };
};
