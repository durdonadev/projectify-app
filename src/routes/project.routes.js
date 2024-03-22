import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { projectController } from "../controllers/project.controller.js";
import { storyController } from "../controllers/story.controller.js";

const projectRouter = Router();
projectRouter.post(
    "/:id/contributors/add",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    projectController.addContributor
);

projectRouter.patch(
    "/:id/contributors/:teamMemberId/change-status",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    projectController.changeContributorStatus
);

projectRouter.get(
    "/:id/contributors",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    projectController.getContributors
);

projectRouter.get(
    "/stories/:projectId",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    storyController.getAll
);

projectRouter.post(
    "/",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    projectController.create
);

projectRouter.get(
    "/:id",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    projectController.getOne
);

projectRouter.patch(
    "/:id/update",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    projectController.update
);

projectRouter.get(
    "/",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    projectController.getAll
);

projectRouter.patch(
    "/:id/change-status",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    projectController.changeStatus
);

export { projectRouter };
