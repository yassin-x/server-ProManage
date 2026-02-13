export const redisKeys = {
  userAuditLogs: (userId: string) => `user:${userId}:audit-logs:v1`,
  userAuth: (userId: string) => `userId-${userId}`,
  userSessions: (userId: string) => `refresh_token:${userId}`,
};
