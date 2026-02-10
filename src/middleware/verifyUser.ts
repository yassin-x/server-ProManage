import jwt, { JwtPayload } from "jsonwebtoken";
import { catchError } from "../utils/CatchError";
import { db } from "../lib/prisma";
import { User } from "../generated/prisma/client";

export const verifyUser = catchError(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "User Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized - token missing" });
  }

  let decoded: JwtPayload & { userId: string };
  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string,
    ) as JwtPayload & { userId: string };
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized - invalid token" });
  }

  const user = await db.user.findUnique({
    where: { id: decoded.userId },
  });

  req.user = user as User;
  next();
});
