import { DataSource } from 'typeorm';
import { AdminUser } from '../entities/AdminUser';
import { Attendance } from '../entities/Attendance';
import { Branch } from '../entities/Branch';
import { ReceptionUser } from '../entities/ReceptionUser';
import { Role } from '../entities/Role';
import { Teacher } from '../entities/Teacher';
import { TeacherFaceData } from '../entities/TeacherFaceData';

const databaseUrl = process.env.DATABASE_URL;
const sslEnabled = process.env.DB_SSL === 'true' || (Boolean(databaseUrl) && process.env.DB_SSL !== 'false');
const synchronize = process.env.DB_SYNCHRONIZE !== 'false';

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...(databaseUrl
    ? { url: databaseUrl }
    : {
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT ?? 5432),
        username: process.env.DB_USERNAME ?? 'postgres',
        password: process.env.DB_PASSWORD ?? 'postgres',
        database: process.env.DB_DATABASE ?? 'dhrusti_guru'
      }),
  ssl: sslEnabled ? { rejectUnauthorized: false } : false,
  synchronize,
  logging: false,
  entities: [
    AdminUser,
    ReceptionUser,
    Role,
    Branch,
    Teacher,
    TeacherFaceData,
    Attendance
  ],
  migrations: ['dist/migrations/*.js'],
  subscribers: ['dist/subscribers/*.js']
});
