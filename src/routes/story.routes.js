import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { storyController } from "../controllers/story.controller.js";

const storyRouter = Router();

storyRouter.post(
    "/",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    authMiddleware.verifyCreateStoryPermissions,
    storyController.create
);

storyRouter.get(
    "/:id",
    authMiddleware.authenticate,
    authMiddleware.verifyReadUpdateDeleteStoryPermissions,
    storyController.getOne
);

storyRouter.patch(
    "/:id",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    authMiddleware.verifyReadUpdateDeleteStoryPermissions,
    storyController.update
);

storyRouter.patch(
    "/:id/archive",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    authMiddleware.verifyReadUpdateDeleteStoryPermissions,
    storyController.archive
);

export { storyRouter };
