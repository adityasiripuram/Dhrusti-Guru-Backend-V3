import { AppDataSource } from '../config/database';
import { Teacher } from '../entities/Teacher';

export async function createTeacher(data: Partial<Teacher>): Promise<Teacher> {
  const repo = AppDataSource.getRepository(Teacher);
  const teacher = repo.create(data);
  return repo.save(teacher);
}

export async function listTeachers(branchId?: string): Promise<Teacher[]> {
  const repo = AppDataSource.getRepository(Teacher);
  if (branchId) {
    return repo.find({ where: { branch: { id: branchId } } });
  }
  return repo.find();
}

export async function getTeacherById(id: string): Promise<Teacher | null> {
  const repo = AppDataSource.getRepository(Teacher);
  return repo.findOne({ where: { id } });
}

export async function updateTeacher(id: string, updates: Partial<Teacher>): Promise<Teacher> {
  const repo = AppDataSource.getRepository(Teacher);
  const teacher = await repo.findOneOrFail({ where: { id } });
  repo.merge(teacher, updates);
  return repo.save(teacher);
}

export async function deleteTeacher(id: string): Promise<void> {
  const repo = AppDataSource.getRepository(Teacher);
  await repo.delete(id);
}
