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

export { storyRouter };
