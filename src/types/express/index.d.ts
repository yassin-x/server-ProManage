import "express";
import { User } from "../../generated/prisma/client";

declare module "express-serve-static-core" {
  interface Request {
    user?: User;
    sessionId?: string;
  }
}
