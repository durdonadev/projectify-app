import { Router } from "express";
import { userController } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.post("/sign-up", userController.signUp);
userRouter.post("/login", userController.login);
userRouter.get("/activate", userController.activate);
userRouter.patch("/forgot-password", userController.forgotPassword);
userRouter.patch("/reset-password", userController.resetPassword);
userRouter.get("/me", userController.getMe);
userRouter.delete("/logout", userController.logout);

export { userRouter };
