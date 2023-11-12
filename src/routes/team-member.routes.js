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

export { teamMemberRouter };
