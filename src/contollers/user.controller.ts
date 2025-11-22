import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User";
import dotenv from "dotenv";

export async function LoginController(
  req: Request,
  res: Response
): Promise<void> {
  const jwtSecret = process.env.JWT_SECRET;
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        meaasge: "Please Enter full details",
      });
    }

    const userFromDb = await User.findOne({ email });

    if (!userFromDb) {
      res.status(403).json({
        success: false,
        message: "You are not authorized",
      });
    }

    const userId = userFromDb?._id.toString();

    const payload = { userId };

    const refreshToken = await jwt.sign(payload, jwtSecret, {
      expiresIn: "7d",
    });

    res.status(200).json({
      refreshToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong in api",
    });
  }
}

export const SignupController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Details not valid",
      });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPass,
    });

    if (!newUser) {
      res.status(403).json({
        success: false,
        message: "User not created",
      });
    }

    res.status(201).json({
      sucess: true,
      message: "User Created",
    });
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
