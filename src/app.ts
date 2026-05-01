import cors from "cors";
import express from "express";
import expressAsyncErrors from "express-async-errors";
import helmet from "helmet";
import morgan from "morgan";

import { errorHandler } from "./middleware/errorHandler";
import { attendanceRouter } from "./routes/attendance";
import { authRouter } from "./routes/auth";
import { faceRouter } from "./routes/face";
import { teacherRouter } from "./routes/teachers";
import uploadRouter from "./routes/upload";
import { logger } from "./utils/logger";

expressAsyncErrors;

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan("combined", { stream: { write: (msg) => logger.info(msg.trim()) } }),
);

app.use("/api/admin", authRouter);
app.use("/api/teachers", teacherRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/face", faceRouter);
app.use("/api/upload", uploadRouter);

app.get("/health", (_req, res) => res.send({ status: "ok" }));

app.use(errorHandler);
