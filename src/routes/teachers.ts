import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import {
  registerTeacherController,
  listTeachersController,
  updateTeacherController,
  deleteTeacherController
} from '../controllers/teacherController';

export const teacherRouter = Router();

// All routes require authentication
teacherRouter.use(requireAuth);

// Receptionists and admins can list/read teachers, but only admins can delete
teacherRouter.get('/', requireRole(['admin', 'receptionist']), listTeachersController);
teacherRouter.post('/', requireRole(['admin', 'receptionist']), registerTeacherController);
teacherRouter.put('/:id', requireRole(['admin']), updateTeacherController);
teacherRouter.delete('/:id', requireRole(['admin']), deleteTeacherController);
