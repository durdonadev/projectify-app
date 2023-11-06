import { Router } from "express";
import { userMiddleware } from "../middlewares/user.middleware.js";
import { projectController } from "../controllers/project.controller.js";

const projectRouter = Router();

projectRouter.post("/", userMiddleware.authenticate, projectController.create);
projectRouter.get(
    "/:id",
    userMiddleware.authenticate,
    projectController.getOne
);

projectRouter.patch(
    "/:id",
    userMiddleware.authenticate,
    projectController.update
);
projectRouter.get("/", userMiddleware.authenticate, projectController.getAll);

projectRouter.patch(
    "/:id/archive",
    userMiddleware.authenticate,
    projectController.archive
);
projectRouter.patch(
    "/:id/reactivate",
    userMiddleware.authenticate,
    projectController.reactivate
);

export { projectRouter };
