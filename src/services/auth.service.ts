import { accessToken } from "../lib/generateToken";
import redis from "../lib/redis";
import { redisKeys } from "./cacheKey.service";

export const refreshAccessToken = async (userId: string, sessionId: string) => {
  const cacheKey = redisKeys.userSessions(userId);
  const token = await redis.hget(cacheKey, sessionId);

  if (!token) {
    throw new Error("Unauthorized - refresh token missing or expired");
  }

  const access_token = accessToken(userId, sessionId);

  return { access_token };
};
