export const redisKeys = {
  userAuditLogs: (userId: string) => `user:${userId}:audit-logs:v1`,
  userAuth: (userId: string) => `user:${userId}:auth:v1`,
  userSessions: (userId: string) => `user:${userId}:sessions:v1`,
  userProfile: (userId: string) => `user:${userId}:profile:v1`,
  userProjects: (userId: string) => `user:${userId}:projects:v1`,
};
