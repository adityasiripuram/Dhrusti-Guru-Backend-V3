//import { Request, Response } from 'express';
import { Request, Response } from 'express';
import { matchTeacherFace, registerTeacherFace } from '../services/faceService';

export async function registerFaceController(req: Request, res: Response) {
  const { teacherId, captureAngle } = req.body;
  const file = (req as any).file;

  if (!teacherId) {
    return res.status(400).json({ message: 'teacherId is required' });
  }

  if (!file?.buffer) {
    return res.status(400).json({ message: 'Image file is required (multipart/form-data)' });
  }

  const record = await registerTeacherFace(teacherId, file.buffer, captureAngle);
  return res.status(201).json(record);
}

export async function matchFaceController(req: Request, res: Response) {
  const file = (req as any).file;
  if (!file?.buffer) {
    return res.status(400).json({ message: 'Image file is required (multipart/form-data)' });
  }

  const result = await matchTeacherFace(file.buffer);
  if (!result?.teacher) {
    return res.status(404).json({ message: 'No face match found' });
  }

  return res.json({ teacher: result.teacher, confidence: result.confidence });
}
