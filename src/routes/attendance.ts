import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { checkInController, checkOutController, reportController } from '../controllers/attendanceController';

export const attendanceRouter = Router();

attendanceRouter.use(requireAuth);
attendanceRouter.post('/checkin', requireRole(['admin', 'receptionist']), checkInController);
attendanceRouter.post('/checkout', requireRole(['admin', 'receptionist']), checkOutController);
attendanceRouter.get('/report', requireRole(['admin', 'receptionist']), reportController);
