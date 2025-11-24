import express, { Express } from "express";
import dotenv from "dotenv";
import userRouter from "./routes/user/userRoute";
import DbConnect from "./libs/db";
import cookieParser from "cookie-parser";

dotenv.config();

const app: Express = express();
// middlewares
app.use(express.json());
app.use(cookieParser());

app.use("/api/user", userRouter);

DbConnect();

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Backend is running on port ${PORT}`);
});

// dsdasd
