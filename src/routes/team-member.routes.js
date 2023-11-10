import { Router } from "express";
import { userMiddleware } from "../middlewares/user.middleware.js";
import { teamMemberController } from "../controllers/team-member.controller.js";

const teamMemberRouter = new Router();

teamMemberRouter.post(
    "/",
    userMiddleware.authenticate,
    teamMemberController.create
);

teamMemberRouter.patch("/create-password", teamMemberController.createPassword);

export { teamMemberRouter };
