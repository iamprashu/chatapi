import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export default async function regenerateToken(
  req: Request,
  res: Response
): Promise<any> {
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET!;
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      res.status(402).json({
        success: false,
        message: "No token found",
      });
    }

    const verityToken = await jwt.verify(refreshToken, refreshSecret);

    if (!verityToken) {
      res.status(402).json({
        success: false,
        message: "No token found",
      });
    }
  } catch (error) {}
}
