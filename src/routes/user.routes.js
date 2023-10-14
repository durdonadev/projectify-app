import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { CookieMiddleware } from "../middlewares/cookie.middleware.js";

const userRouter = Router();

userRouter.post("/sign-up", userController.signUp);
userRouter.post("/login", userController.login);
userRouter.get("/activate", userController.activate);
userRouter.patch("/forgot-password", userController.forgotPassword);
userRouter.patch("/reset-password", userController.resetPassword);
userRouter.get("/me", CookieMiddleware.verify, userController.getMe);
userRouter.delete("/logout", CookieMiddleware.verify, userController.logout);

export { userRouter };
