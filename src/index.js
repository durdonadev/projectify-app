import express from "express";
import { userRouter } from "./routes/user.routes.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { GlobalError } from "./middlewares/global-error.middleware.js";

dotenv.config();

const app = express();
app.use(cookieParser());
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.use("/users", userRouter);
app.use(GlobalError.handle);

app.listen(PORT, () => {
    console.log("Server is running on ", PORT);
});
