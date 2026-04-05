import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import expressAsyncErrors from 'express-async-errors';

import { authRouter } from './routes/auth';
import { teacherRouter } from './routes/teachers';
import { attendanceRouter } from './routes/attendance';
import { faceRouter } from './routes/face';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

expressAsyncErrors;

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

app.use('/api/admin', authRouter);
app.use('/api/teachers', teacherRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/face', faceRouter);

app.get('/health', (_req, res) => res.send({ status: 'ok' }));

app.use(errorHandler);
