export const catchAsync = (routeHandler) => {
    return async (req, res, next) => {
        try {
            await routeHandler(req, res, next);
        } catch (error) {
            console.log(error);
            next(error);
        }
    };
};
