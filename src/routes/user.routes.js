import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { CookieMiddleware } from "../middlewares/cookie.middleware.js";
import { userMiddleware } from "../middlewares/user.middleware.js";
import { GlobalError } from "../middlewares/global-error.middleware.js";

const userRouter = Router();

userRouter.post("/sign-up", userController.signUp, GlobalError.handle);
userRouter.post("/login", userController.login);
userRouter.get("/activate", userController.activate);
userRouter.patch("/forgot-password", userController.forgotPassword);
userRouter.patch("/reset-password", userController.resetPassword);
userRouter.get("/me", userMiddleware.authenticate, userController.getMe);
userRouter.delete(
    "/logout",
    userMiddleware.authenticate,
    userController.logout
);
userRouter.patch(
    "/me/tasks",
    userMiddleware.authenticate,
    userController.createTask
);

userRouter.get(
    "/me/tasks",
    userMiddleware.authenticate,
    userController.getTasks
);

userRouter.get(
    "/me/tasks/:taskId",
    userMiddleware.authenticate,
    userController.getTask
);

userRouter.delete(
    "/me/tasks/:taskId",
    userMiddleware.authenticate,
    userController.deleteTask
);

userRouter.patch(
    "/me/tasks/:taskId",
    userMiddleware.authenticate,
    userController.updateTask
);

export { userRouter };
