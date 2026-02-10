import bcrypt from "bcryptjs";
import { db } from "../lib/prisma";
import { catchError } from "../utils/CatchError";
import { sendResponse } from "../utils/response.helper";
import { generateToken } from "../lib/generateToken";
import { createAuditLog } from "../services/auditLog.service";
import { AuditAction, AuditEntityType } from "../constants/enums";

export const register = catchError(async (req, res) => {
  const { email, password, username, firstName, lastName } = req.body;

  if (!email || !password || !username || !firstName || !lastName) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      status: "error",
      message: "All required fields must be provided",
    });
  }

  const emailExists = await db.user.findUnique({
    where: { email },
  });

  if (emailExists) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      status: "error",
      message: "Email already exists",
    });
  }

  const usernameExists = await db.user.findUnique({
    where: { username },
  });

  if (usernameExists) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      status: "error",
      message: "Username already exists",
    });
  }

  const hashedPassword = bcrypt.hashSync(password, 12);
  const newUser = await db.user.create({
    data: {
      email,
      password: hashedPassword,
      username,
      firstName,
      lastName,
    },
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    status: "success",
    message: "User registered successfully",
    data: {
      user: {
        ...newUser,
        password: undefined,
      },
    },
  });
});

export const login = catchError(async (req, res) => {
  const { email, passwpord } = req.body;

  if (!email || !passwpord) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      status: "error",
      message: "email and password required fields must be provided",
    });
  }

  const user = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      status: "error",
      message: "User not found",
    });
  }

  const isValidPassword = bcrypt.compareSync(passwpord, user.password);

  if (!isValidPassword) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      status: "error",
      message: "Password is incorrect",
    });
  }

  const { access_token } = generateToken(res, user.id);

  await createAuditLog({
    actorId: user.id,
    action: AuditAction.USER_LOGIN,
    entityType: AuditEntityType.USER,
    entityId: user.id,
    metadata: {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    status: "success",
    message: "User logged in successfully",
    data: {
      user: {
        ...user,
        password: undefined,
      },
      meta: {
        access_token,
      },
    },
  });
});

export const refreshToken = catchError(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      status: "error",
      message: "Unauthorized",
    });
  }

  const { access_token } = generateToken(res, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    status: "success",
    message: "Access token refreshed successfully",
    data: {
      meta: {
        access_token,
      },
    },
  });
});

export const profileUser = catchError(async (req, res) => {
  const user = req.user;
  if (!user) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      status: "error",
      message: "Unauthorized",
    });
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    status: "success",
    message: "User profile retrieved successfully",
    data: {
      user: {
        ...user,
        password: undefined,
      },
    },
  });
});

export const logout = catchError(async (req, res) => {
  const user = req.user;
  if (!user) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      status: "error",
      message: "Unauthorized",
    });
  }
  await createAuditLog({
    actorId: user.id,
    action: AuditAction.USER_LOGOUT,
    entityType: AuditEntityType.USER,
    entityId: user.id,
    metadata: {
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "unknown",
    },
  });

  res.clearCookie("refresh_token");
  sendResponse(res, {
    statusCode: 200,
    success: true,
    status: "success",
    message: "User logged out successfully",
  });
});
