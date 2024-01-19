import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { teamMemberController } from "../controllers/team-member.controller.js";

const teamMemberRouter = new Router();

teamMemberRouter.post(
    "/",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    teamMemberController.create
);

teamMemberRouter.patch("/create-password", teamMemberController.createPassword);

teamMemberRouter.get(
    "/",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    teamMemberController.getAll
);

teamMemberRouter.patch(
    "/deactivate",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    teamMemberController.deactivate
);

teamMemberRouter.patch(
    "/reactivate",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    teamMemberController.reactivate
);

teamMemberRouter.post("/login", teamMemberController.login);
teamMemberRouter.patch("/forgot-password", teamMemberController.forgotPassword);
teamMemberRouter.patch("/reset-password", teamMemberController.resetPassword);
teamMemberRouter.get(
    "/me",
    authMiddleware.authenticate,
    teamMemberController.getMe
);

export { teamMemberRouter };
