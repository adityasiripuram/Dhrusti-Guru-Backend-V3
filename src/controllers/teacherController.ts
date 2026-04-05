import { Request, Response } from 'express';
import { createTeacher, listTeachers, updateTeacher, deleteTeacher } from '../services/teacherService';

export async function registerTeacherController(req: Request, res: Response) {
  const teacher = await createTeacher(req.body);
  return res.status(201).json(teacher);
}

export async function listTeachersController(req: Request, res: Response) {
  const branchId = (req as any).user?.branchId;
  const teachers = await listTeachers(branchId);
  return res.json(teachers);
}

export async function updateTeacherController(req: Request, res: Response) {
  const { id } = req.params;
  const teacher = await updateTeacher(id, req.body);
  return res.json(teacher);
}

export async function deleteTeacherController(req: Request, res: Response) {
  const { id } = req.params;
  await deleteTeacher(id);
  return res.status(204).send();
}
