import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoUrl: string = process.env.MONGO_URL!;

export default function DbConnect() {
  mongoose
    .connect(mongoUrl)
    .then(() => {
      console.log("Database Connected");
    })
    .catch((errror) => {
      console.error("Error while connecting db");
      console.error(errror);
    });
}
