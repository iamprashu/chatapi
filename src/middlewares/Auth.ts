import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import Session from "../models/Session";

export const AuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET!;
  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET!;
  const { refreshToken } = req.cookies as { refreshToken: string };
  const { accessToken } = req.body;

  if (!refreshToken || !accessToken) {
    res.status(401).json({
      success: false,
      message: "Sorry Authentication Failed",
    });

    return;
  }

  try {
    // try block for token verification
    const refreshPayload = (await jwt.verify(
      refreshToken,
      refreshTokenSecret
    )) as JwtPayload & { userId: string };

    if (!refreshPayload) {
      res.status(401).json({
        success: false,
        message: "Authentication Failure",
      });
    }

    const validateRefreshToken = await Session.findOne({
      userId: refreshPayload.userId,
      refreshToken,
    });

    if (!validateRefreshToken) {
      res.status(401).json({
        success: false,
        message: "Authentication Failure",
      });
    }

    try {
      const accessTokenPayload = await jwt.verify(
        accessToken,
        accessTokenSecret
      );
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        // this for only access token expiry
        // verify refresh token and get id from it expiry from it
        // make new access token and
        // frsh token ki expiry old token me se clone krni h token change
      }
    }
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      // this for only refresh token expiry
      res.status(401).json({
        success: false,
        message: "Please login again",
      });
    }
  }
};
