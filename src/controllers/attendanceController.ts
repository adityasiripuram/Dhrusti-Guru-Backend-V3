import { Request, Response } from 'express';
import { checkIn, checkOut, getAttendanceReport } from '../services/attendanceService';

export async function checkInController(req: Request, res: Response) {
  const teacherId = req.body.teacherId;
  if (!teacherId) {
    return res.status(400).json({ message: 'teacherId is required' });
  }

  const record = await checkIn(teacherId);
  return res.json(record);
}

export async function checkOutController(req: Request, res: Response) {
  const teacherId = req.body.teacherId;
  if (!teacherId) {
    return res.status(400).json({ message: 'teacherId is required' });
  }

  const record = await checkOut(teacherId);
  return res.json(record);
}

export async function reportController(req: Request, res: Response) {
  const branchId = (req as any).user?.branchId;
  if (!branchId) {
    return res.status(400).json({ message: 'Branch context missing' });
  }

  const { fromDate, toDate } = req.query;
  const report = await getAttendanceReport(branchId, fromDate as string | undefined, toDate as string | undefined);
  return res.json(report);
}
