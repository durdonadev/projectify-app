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
    authMiddleware.verifyReadUpdateDeleteStoryAndSubtaskPermissions,
    storyController.getOne
);

storyRouter.patch(
    "/:id",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    authMiddleware.verifyReadUpdateDeleteStoryAndSubtaskPermissions,
    storyController.update
);

storyRouter.patch(
    "/:id/archive",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    authMiddleware.verifyReadUpdateDeleteStoryAndSubtaskPermissions,
    storyController.archive
);

storyRouter.patch(
    "/:storyId/subTasks",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    authMiddleware.verifyReadUpdateDeleteStoryAndSubtaskPermissions,
    storyController.createSubTask
);

storyRouter.get(
    "/:storyId/subTasks/:subTaskId",
    authMiddleware.authenticate,
    authMiddleware.verifyReadUpdateDeleteStoryAndSubtaskPermissions,
    storyController.getSubTask
);

storyRouter.get(
    "/:storyId/subTasks",
    authMiddleware.authenticate,
    authMiddleware.verifyReadUpdateDeleteStoryAndSubtaskPermissions,
    storyController.getAllSubTasks
);

storyRouter.patch(
    "/:storyId/subTasks/:subTaskId",
    authMiddleware.authenticate,
    authMiddleware.verifyReadUpdateDeleteStoryAndSubtaskPermissions,
    storyController.updateSubTask
);

storyRouter.delete(
    "/:storyId/subTasks/:subTaskId",
    authMiddleware.authenticate,
    authMiddleware.verifyReadUpdateDeleteStoryAndSubtaskPermissions,
    storyController.deleteSubTask
);

export { storyRouter };
