import { NextFunction, Request, Response } from "express";

export const AuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.cookies as { refreshToken: string };
    const { accessToken } = req.body;
  } catch (error: any) {}
};
