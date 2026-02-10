import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { sanitizeHTML } from "./middleware/sanitizeHTML";
import AppError from "./utils/AppError";
import { Enviroments } from "./constants/enums";
import AuthRouter from "./routes/auth.route";
import ProfileRouter from "./routes/profile.route";
import ProjectRouter from "./routes/project.route";
import AuditLogRouter from "./routes/auditlog.route";

dotenv.config();
const app = express();

app.use(helmet());
app.use(morgan(process.env.NODE_ENV === Enviroments.PROD ? "combined" : "dev"));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(sanitizeHTML);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/profile", ProfileRouter);
app.use("/api/v1/project", ProjectRouter);
app.use("/api/v1/auditlog", AuditLogRouter);

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
export default app;
