import { AuditLog } from "../generated/prisma/client";
import { db } from "../lib/prisma";
import redis from "../lib/redis";
import { redisKeys } from "../services/cacheKey.service";
import { catchError } from "../utils/CatchError";
import { sendResponse } from "../utils/response.helper";

export const getAllAuditLogsUser = catchError(async (req, res) => {
  const user = req.user;

  if (!user) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      status: "error",
      message: "Unauthorized",
    });
  }

  const cacheKey = redisKeys.userAuditLogs(user.id);
  const cached = await redis.get(cacheKey);
  let auditLogs: AuditLog[];

  if (cached) {
    auditLogs = JSON.parse(cached);
  } else {
    const logs = await db.auditLog.findMany({
      where: { user: { id: user.id } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    
    await redis.set(cacheKey, JSON.stringify(logs), "EX", 5 * 60);
    auditLogs = logs;
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    status: "success",
    message: "Audit logs retrieved successfully",
    data: {
      auditLogs,
    },
  });
});
