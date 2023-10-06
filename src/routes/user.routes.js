import { Router } from "express";
import { userController } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.post("/sign-up", userController.signUp);
userRouter.post("/login", userController.login);

export { userRouter };
