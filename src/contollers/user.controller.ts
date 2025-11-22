import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export async function LoginController(
  req: Request,
  res: Response
): Promise<void> {
  res.json({
    res: "hello",
  });
}

export const SignupController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body as { email: String; password: String };

    if (!email || !password) {
      res.status(401).json({
        success: false,
        message: "Details not valid",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
