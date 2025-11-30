import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import userRouter from "./routes/user/userRoute";
import DbConnect from "./libs/db";
import cookieParser from "cookie-parser";
import validateEnv from "./libs/checkEnv";

dotenv.config();

const app: Express = express();
// middlewares
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  return res.json({
    message: "Welcome",
  });
});

app.use("/api/user", userRouter);

validateEnv();

DbConnect();

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Backend is running on port ${PORT}`);
});
