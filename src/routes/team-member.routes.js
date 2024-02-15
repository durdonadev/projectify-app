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
    "/:id/deactivate",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    teamMemberController.deactivate
);

teamMemberRouter.patch(
    "/:id/reactivate",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    teamMemberController.reactivate
);

teamMemberRouter.delete(
    "/:id/delete",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    teamMemberController.delete
);
teamMemberRouter.post("/login", teamMemberController.login);
teamMemberRouter.patch("/forgot-password", teamMemberController.forgotPassword);
teamMemberRouter.patch("/reset-password", teamMemberController.resetPassword);
teamMemberRouter.get(
    "/me",
    authMiddleware.authenticate,
    authMiddleware.isTeamMember,
    teamMemberController.getMe
);

teamMemberRouter.patch(
    "/me/change-password",
    authMiddleware.authenticate,
    authMiddleware.isTeamMember,
    teamMemberController.changePassword
);

teamMemberRouter.patch(
    "/me/tasks",
    authMiddleware.authenticate,
    authMiddleware.isTeamMember,
    teamMemberController.createTask
);
teamMemberRouter.get(
    "/me/tasks/:taskId",
    authMiddleware.authenticate,
    authMiddleware.isTeamMember,
    teamMemberController.getTask
);
teamMemberRouter.get(
    "/me/tasks",
    authMiddleware.authenticate,
    authMiddleware.isTeamMember,
    teamMemberController.getTasks
);
teamMemberRouter.patch(
    "/me/tasks/:taskId",
    authMiddleware.authenticate,
    authMiddleware.isTeamMember,
    teamMemberController.updateTask
);
teamMemberRouter.patch(
    "/me/tasks/:taskId/delete",
    authMiddleware.authenticate,
    authMiddleware.isTeamMember,
    teamMemberController.deleteTask
);

export { teamMemberRouter };
