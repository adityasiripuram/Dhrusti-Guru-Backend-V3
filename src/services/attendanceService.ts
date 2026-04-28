import { AppDataSource } from '../config/database';
import { Attendance, AttendanceStatus } from '../entities/Attendance';
import { Teacher } from '../entities/Teacher';

export async function checkIn(teacherId: string, checkInTime: Date = new Date()): Promise<Attendance> {
  const attendanceRepo = AppDataSource.getRepository(Attendance);
  const teacherRepo = AppDataSource.getRepository(Teacher);

  const teacher = await teacherRepo.findOneOrFail({ where: { id: teacherId } });
  const date = new Date().toISOString().slice(0, 10);
  let record = await attendanceRepo.findOne({ where: { teacher: { id: teacherId }, date } });

  if (!record) {
    record = attendanceRepo.create({ teacher, date, checkInTime, status: AttendanceStatus.Present });
  } else {
    record.checkInTime = record.checkInTime ?? checkInTime;
  }

  return attendanceRepo.save(record);
}

export async function checkOut(teacherId: string, checkOutTime: Date = new Date()): Promise<Attendance> {
  const attendanceRepo = AppDataSource.getRepository(Attendance);
  const teacherRepo = AppDataSource.getRepository(Teacher);

  const teacher = await teacherRepo.findOneOrFail({ where: { id: teacherId } });
  const date = new Date().toISOString().slice(0, 10);
  const record = await attendanceRepo.findOne({ where: { teacher: { id: teacherId }, date } });

  if (!record) {
    const error = new Error('No check-in record found for today') as Error & { status: number };
    error.status = 400;
    throw error;
  }

  record.checkOutTime = checkOutTime;
  if (record.checkInTime) {
    const hours = (checkOutTime.getTime() - record.checkInTime.getTime()) / (1000 * 60 * 60);
    record.totalHours = Number(hours.toFixed(2));
  }

  record.status = AttendanceStatus.Left;

  return attendanceRepo.save(record);
}

export async function getAttendanceReport(
  branchId: string,
  fromDate?: string,
  toDate?: string
): Promise<Attendance[]> {
  const attendanceRepo = AppDataSource.getRepository(Attendance);

  const query = attendanceRepo
    .createQueryBuilder('attendance')
    .leftJoinAndSelect('attendance.teacher', 'teacher')
    .leftJoinAndSelect('teacher.branch', 'branch')
    .where('branch.id = :branchId', { branchId });

  if (fromDate) {
    query.andWhere('attendance.date >= :fromDate', { fromDate });
  }
  if (toDate) {
    query.andWhere('attendance.date <= :toDate', { toDate });
  }

  return query.orderBy('attendance.date', 'DESC').getMany();
}
