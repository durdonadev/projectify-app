/* eslint-disable @typescript-eslint/no-explicit-any */
import * as core from 'express-serve-static-core';
import { Request, Response, NextFunction } from 'express';

export const catchAsync = <
    P = core.ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = core.Query,
>(
    routeHandler: (
        req: Request<P, ResBody, ReqBody, ReqQuery>,
        res: Response<ResBody>,
        next: NextFunction,
    ) => Promise<void> | void,
) => {
    return async (
        req: Request<P, ResBody, ReqBody, ReqQuery>,
        res: Response<ResBody>,
        next: NextFunction,
    ) => {
        try {
            await routeHandler(req, res, next);
        } catch (error) {
            console.log(error);
            next(error);
        }
    };
};
