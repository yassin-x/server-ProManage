import { db } from "../lib/prisma";
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

  const auditLogs = await db.auditLog.findMany({
    where: {
      userId: user.id,
    },
  });

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
