import { Router } from "express";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { projectController } from "../controllers/project.controller.js";

const projectRouter = Router();

projectRouter.post("/", adminMiddleware.authenticate, projectController.create);
projectRouter.get(
    "/:id",
    adminMiddleware.authenticate,
    projectController.getOne
);

projectRouter.patch(
    "/:id",
    adminMiddleware.authenticate,
    projectController.update
);
projectRouter.get("/", adminMiddleware.authenticate, projectController.getAll);

projectRouter.patch(
    "/:id/archive",
    adminMiddleware.authenticate,
    projectController.archive
);
projectRouter.patch(
    "/:id/reactivate",
    adminMiddleware.authenticate,
    projectController.reactivate
);

export { projectRouter };
