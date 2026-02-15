import { AuditAction, AuditEntityType } from "../constants/enums";
import { db } from "../lib/prisma";
import redis from "../lib/redis";
import { createAuditLog } from "../services/auditLog.service";
import { redisKeys } from "../services/cacheKey.service";
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

  const cacheKey = redisKeys.userProfile(user.id);
  const cached = await redis.get(cacheKey);
  let profile;

  if (cached) {
    profile = JSON.parse(cached);
  } else {
    profile = await db.profile.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!profile) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        status: "error",
        message: "Profile not found",
      });
    }

    await redis.set(cacheKey, JSON.stringify(profile), "EX", 60 * 60 * 24);
  }

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

  const existingProfile = await db.profile.findUnique({
    where: { userId: user.id },
  });

  if (existingProfile) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      status: "error",
      message: "Profile already exists",
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

  const cacheKey = redisKeys.userProfile(user.id);
  await redis.del(cacheKey);

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

  const cacheKey = redisKeys.userProfile(user.id);
  await redis.del(cacheKey);

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
