import { Router } from 'express';
import multer from 'multer';
import { requireAuth, requireRole } from '../middleware/auth';
import { matchFaceController, registerFaceController } from '../controllers/faceController';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

export const faceRouter = Router();

faceRouter.use(requireAuth);

faceRouter.post('/register', requireRole(['admin', 'receptionist']), upload.single('image'), registerFaceController);
faceRouter.post('/match', requireRole(['admin', 'receptionist']), upload.single('image'), matchFaceController);
