import { AuditAction, AuditEntityType } from "../constants/enums";
import { db } from "../lib/prisma";
import { createAuditLog } from "../services/auditLog.service";
import { catchError } from "../utils/CatchError";
import { sendResponse } from "../utils/response.helper";

export const getUserProjects = catchError(async (req, res) => {
  const user = req.user;
  const projects = await db.project.findMany({
    where: {
      ownerId: user?.id,
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    status: "success",
    message: "Projects retrieved successfully",
    data: {
      projects,
    },
  });
});

export const createProject = catchError(async (req, res) => {
  const { title, description, githubLink, previewLink, tags, visibility } =
    req.body;
  const user = req.user;

  if (!user) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      status: "error",
      message: "Unauthorized",
    });
  }

  if (!title || !description || !githubLink || !previewLink || !visibility) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      status: "fail",
      message: "Missing required fields",
    });
  }

  const project = await db.project.create({
    data: {
      title,
      description,
      githubLink,
      previewLink,
      tags,
      visibility,
      owner: {
        connect: {
          id: user?.id,
        },
      },
    },
  });

  await createAuditLog({
    actorId: user.id,
    action: AuditAction.PROJECT_CREATE,
    entityType: AuditEntityType.PROJECT,
    entityId: project.id,
    metadata: {
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "unknown",
    },
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    status: "success",
    message: "Project created successfully",
    data: {
      project,
    },
  });
});

export const updateProject = catchError(async (req, res) => {
  const { id } = req.params;
  const { title, description, githubLink, previewLink, tags, visibility } =
    req.body;

  const user = req.user;

  if (!user) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      status: "error",
      message: "Unauthorized",
    });
  }

  const project = await db.project.update({
    where: {
      id: id as string,
    },
    data: {
      title,
      description,
      githubLink,
      previewLink,
      tags,
      visibility,
    },
  });

  await createAuditLog({
    actorId: user.id,
    action: AuditAction.PROJECT_UPDATE,
    entityType: AuditEntityType.PROJECT,
    entityId: project.id,
    metadata: {
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "unknown",
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    status: "success",
    message: "Project updated successfully",
    data: {
      project,
    },
  });
});

export const deleteProject = catchError(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  if (!user) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      status: "error",
      message: "Unauthorized",
    });
  }

  const project = await db.project.findUnique({
    where: {
      id: id as string,
    },
  });

  await db.project.delete({
    where: {
      id: id as string,
    },
  });

  await createAuditLog({
    actorId: user.id,
    action: AuditAction.PROJECT_DELETE,
    entityType: AuditEntityType.PROJECT,
    entityId: project!.id,
    metadata: {
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "unknown",
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    status: "success",
    message: "Project deleted successfully",
  });
});

export const getProjectById = catchError(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  if (!user) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      status: "error",
      message: "Unauthorized",
    });
  }

  const project = await db.project.findUnique({
    where: {
      id: id as string,
    },
  });

  if (project?.visibility === "PRIVATE" && project.ownerId !== user.id) {
    return sendResponse(res, {
      statusCode: 403,
      success: false,
      status: "error",
      message: "Forbidden - you do not have access to this project",
    });
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    status: "success",
    message: "Project retrieved successfully",
    data: {
      project,
    },
  });
});

export const getPublicProjectsUser = catchError(async (req, res) => {
  const { userId } = req.params;

  const projects = await db.project.findMany({
    where: {
      visibility: "PUBLIC",
      owner: {
        id: userId as string,
      },
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    status: "success",
    message: "Projects retrieved successfully",
    data: {
      projects,
    },
  });
});

export const getPrivateProjectsUser = catchError(async (req, res) => {
  const { userId } = req.params;

  const projects = await db.project.findMany({
    where: {
      visibility: "PRIVATE",
      owner: {
        id: userId as string,
      },
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    status: "success",
    message: "Projects retrieved successfully",
    data: {
      projects,
    },
  });
});
