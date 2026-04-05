import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database';
import { AdminUser } from '../entities/AdminUser';
import { ReceptionUser } from '../entities/ReceptionUser';
import { Role } from '../entities/Role';
import { Branch } from '../entities/Branch';
import { signAccessToken, signRefreshToken, JwtPayload } from '../utils/jwt';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    branchId?: string;
  };
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function loginUser(email: string, password: string): Promise<LoginResult> {
  const adminRepo = AppDataSource.getRepository(AdminUser);
  const user = await adminRepo.findOne({ where: { email } });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const passwordMatch = await comparePassword(password, user.passwordHash);
  if (!passwordMatch) {
    throw new Error('Invalid credentials');
  }

  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role.name,
    branchId: user.branch?.id
  };

  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      branchId: user.branch?.id
    }
  };
}

export async function registerAdmin(
  name: string,
  email: string,
  password: string,
  branchId: string
): Promise<AdminUser> {
  const roleRepo = AppDataSource.getRepository(Role);
  const branchRepo = AppDataSource.getRepository(Branch);
  const adminRepo = AppDataSource.getRepository(AdminUser);

  const role = await roleRepo.findOneBy({ name: 'admin' });
  if (!role) {
    throw new Error('Admin role not found; please seed roles.');
  }

  const branch = await branchRepo.findOneBy({ id: branchId });
  if (!branch) {
    throw new Error('Branch not found');
  }

  const passwordHash = await hashPassword(password);

  const admin = adminRepo.create({
    name,
    email,
    passwordHash,
    role,
    branch
  });

  return adminRepo.save(admin);
}
