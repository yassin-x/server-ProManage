import { Response } from "express";
import jwt from "jsonwebtoken";

export const generateToken = (res: Response, userId: string) => {
  const access_token = jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET as string,
    {
      expiresIn: "15m",
    },
  );

  const refresh_token = jwt.sign(
    {
      userId,
    },
    process.env.JWT_REFRESH_SECRET as string,
    {
      expiresIn: "7d",
    },
  );

  res.cookie("refresh_token", refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return {
    access_token,
  };
};
