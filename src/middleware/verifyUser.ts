import jwt, { JwtPayload } from "jsonwebtoken";
import { catchError } from "../utils/CatchError";
import { User } from "../generated/prisma/client";
import redis from "../lib/redis";
import { redisKeys } from "../services/cacheKey.service";

export const verifyUser = catchError(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const sessionId = req.headers["x-session-id"] as string;

  if (!authHeader || !authHeader.startsWith("Bearer ") || !sessionId) {
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

  const sessionCacheKey = redisKeys.userSessions(decoded.userId);
  const storedToken = await redis.hget(sessionCacheKey, decoded.sessionId);
  if (!storedToken) {
    return res
      .status(401)
      .json({ message: "Unauthorized - session expired or invalid" });
  }

  const cacheKey = redisKeys.userAuth(decoded.userId);
  const cachedUser = await redis.get(cacheKey);

  if (!cachedUser) {
    return res
      .status(401)
      .json({ message: "Unauthorized - user not logged in" });
  }

  req.user = JSON.parse(cachedUser) as User;
  req.sessionId = decoded.sessionId;
  next();
});
