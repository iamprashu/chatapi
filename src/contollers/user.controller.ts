import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User";
import dotenv from "dotenv";
import Session from "../models/Session";

export async function LoginController(
  req: Request,
  res: Response
): Promise<any> {
  const jwtSecret = process.env.JWT_SECRET;
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
  const accessSecret = process.env.ACCESS_TOKEN_SECRET;
  try {
    console.log(req);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        meaasge: "Please Enter full details",
      });
    }

    const userFromDb = await User.findOne({ email });

    if (!userFromDb) {
      res.status(403).json({
        success: false,
        message: "Invalid user details",
      });
      return;
    }

    const checkPassword = await bcrypt.compare(password, userFromDb?.password);

    if (!checkPassword) {
      res.status(403).json({
        success: false,
        message: "Invalid user details",
      });
    }

    const userId = userFromDb?._id.toString();
    const payload = { userId };

    const refreshToken = await jwt.sign(payload, refreshSecret, {
      expiresIn: "7d",
    });

    const accessToken = await jwt.sign(payload, accessSecret, {
      expiresIn: "15m",
    });

    await Session.findOneAndUpdate(
      { userId },
      {
        refreshToken,
        sessionExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
    });

    res.status(200).json({
      success: true,
      accessToken,
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
): Promise<any> => {
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
