import { AuditAction, AuditEntityType } from "../constants/enums";
import { db } from "../lib/prisma";
import { createAuditLog } from "../services/auditLog.service";
import { catchError } from "../utils/CatchError";
import { sendResponse } from "../utils/response.helper";

export const getProfile = catchError(async (req, res) => {
  const user = req.user;

  if (!user) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      status: "error",
      message: "Unauthorized",
    });
  }

  const profile = await db.profile.findUnique({
    where: {
      userId: user.id,
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    status: "success",
    message: "User profile retrieved successfully",
    data: {
      profile,
    },
  });
});

export const createProfile = catchError(async (req, res) => {
  const { bio, website } = req.body;
  const user = req.user;

  if (!user) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      status: "error",
      message: "Unauthorized",
    });
  }

  const profile = await db.profile.create({
    data: {
      bio,
      website,
      userId: user.id,
    },
  });

  await createAuditLog({
    actorId: user.id,
    action: AuditAction.PROFILE_CREATE,
    entityType: AuditEntityType.PROFILE,
    entityId: profile.id,
    metadata: {
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "unknown",
    },
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    status: "success",
    message: "User profile created successfully",
    data: {
      profile,
    },
  });
});

export const updateProfile = catchError(async (req, res) => {
  const { bio, website } = req.body;
  const user = req.user;
  if (!user) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      status: "error",
      message: "Unauthorized",
    });
  }

  const profile = await db.profile.update({
    where: {
      userId: user.id,
    },
    data: {
      bio,
      website,
    },
  });

  await createAuditLog({
    actorId: user.id,
    action: AuditAction.PROFILE_UPDATE,
    entityType: AuditEntityType.PROFILE,
    entityId: profile.id,
    metadata: {
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "unknown",
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    status: "success",
    message: "User profile updated successfully",
    data: {
      profile,
    },
  });
});
