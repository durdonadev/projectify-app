import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { teamMemberController } from "../controllers/team-member.controller.js";

const teamMemberRouter = new Router();

teamMemberRouter.post(
    "/",
    authMiddleware.authenticate,
    teamMemberController.create
);

teamMemberRouter.patch("/create-password", teamMemberController.createPassword);

teamMemberRouter.get(
    "/",
    authMiddleware.authenticate,
    teamMemberController.getAll
);

teamMemberRouter.patch(
    "/deactivate",
    authMiddleware.authenticate,
    teamMemberController.deactivate
);

teamMemberRouter.patch(
    "/reactivate",
    authMiddleware.authenticate,
    teamMemberController.reactivate
);

export { teamMemberRouter };
