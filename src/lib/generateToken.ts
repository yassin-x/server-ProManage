import jwt from "jsonwebtoken";
import redis from "./redis";
import { redisKeys } from "../services/cacheKey.service";
import { randomUUID } from "crypto";

export const accessToken = (userId: string, sessionId: string) => {
  const access_token = jwt.sign(
    { userId, sessionId },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: "15m" },
  );

  return { access_token };
};

export const refresh_token = async (userId: string) => {
  const cacheKey = redisKeys.userSessions(userId);
  const sessionId = randomUUID();
  const token = jwt.sign(
    { userId, sessionId },
    process.env.JWT_REFRESH_SECRET!,
    {
      expiresIn: "7d",
    },
  );

  await redis.hset(cacheKey, sessionId, token);
  await redis.expire(cacheKey, 7 * 24 * 60 * 60);

  return { sessionId };
};
