import express from "express";
import { getAllAuditLogsUser } from "../controller/auditlog.controller";
import { verifyUser } from "../middleware/verifyUser";

const router = express.Router();

router.get("/", verifyUser, getAllAuditLogsUser);

const AuditLogRouter = router;
export default AuditLogRouter;
