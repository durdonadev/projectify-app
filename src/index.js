import express from "express";
import { userRouter } from "./routes/user.routes.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.use("/users", userRouter);

app.listen(PORT, () => {
    console.log("Server is running on ", PORT);
});
