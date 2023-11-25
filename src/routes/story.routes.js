import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { storyController } from "../controllers/story.controller.js";

const storyRouter = Router();

storyRouter.post(
    "/",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    storyController.create
);

storyRouter.get(
    "/:id",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    storyController.getOne
);

storyRouter.get(
    "/",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    storyController.getAll
);

storyRouter.patch(
    "/:id",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    storyController.update
);

export { storyRouter };
