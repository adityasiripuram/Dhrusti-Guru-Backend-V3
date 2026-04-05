import { AppDataSource } from '../config/database';
import { TeacherFaceData } from '../entities/TeacherFaceData';
import { Teacher } from '../entities/Teacher';
import { matchFace, registerFace } from './faceRecognitionService';

export async function registerTeacherFace(teacherId: string, imageBytes: Buffer, captureAngle?: string) {
  const teacherRepo = AppDataSource.getRepository(Teacher);
  const faceRepo = AppDataSource.getRepository(TeacherFaceData);

  const teacher = await teacherRepo.findOneOrFail({ where: { id: teacherId } });
  const faceId = await registerFace(teacherId, imageBytes);

  const record = faceRepo.create({
    teacher,
    rekognitionFaceId: faceId,
    captureAngle
  });

  return faceRepo.save(record);
}

export async function matchTeacherFace(imageBytes: Buffer) {
  const matchResult = await matchFace(imageBytes);
  if (!matchResult.teacherId) {
    return null;
  }

  const teacherRepo = AppDataSource.getRepository(Teacher);
  const teacher = await teacherRepo.findOne({ where: { id: matchResult.teacherId } });

  return {
    teacher,
    confidence: matchResult.confidence
  };
}
