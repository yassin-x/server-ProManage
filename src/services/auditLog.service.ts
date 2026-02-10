import { AuditAction, AuditEntityType } from "../constants/enums";
import { Prisma } from "../generated/prisma/client";
import { db } from "../lib/prisma";

interface IAduditLog {
  actorId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
}

export const createAuditLog = async (data: IAduditLog) => {
  await db.auditLog.create({
    data: {
      user: {
        connect: {
          id: data.actorId,
        },
      },
      action: data.action,
      entity: data.entityType,
      entityId: data.entityId,
      metadata: data.metadata ?? Prisma.JsonNull,
    },
  });

  return true;
};
