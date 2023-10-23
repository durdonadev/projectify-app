export const catchAsync = (routeHandler) => {
    return async (req, res, next) => {
        try {
            await Promise.resolve(routeHandler(req, res, next));
        } catch (error) {
            next(error);
        }
    };
};
