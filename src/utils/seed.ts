import { AppDataSource } from '../config/database';
import { Branch } from '../entities/Branch';
import { Role } from '../entities/Role';
import { AdminUser } from '../entities/AdminUser';
import { hashPassword } from '../services/authService';

export async function seedInitialData() {
  const roleRepo = AppDataSource.getRepository(Role);
  const branchRepo = AppDataSource.getRepository(Branch);
  const adminRepo = AppDataSource.getRepository(AdminUser);

  const roles = ['admin', 'receptionist'];
  for (const name of roles) {
    const existing = await roleRepo.findOneBy({ name });
    if (!existing) {
      await roleRepo.save(roleRepo.create({ name, description: `${name} role` }));
    }
  }

  const defaultBranchName = process.env.DEFAULT_BRANCH_NAME || 'Default Branch';
  let branch = await branchRepo.findOneBy({ name: defaultBranchName });
  if (!branch) {
    branch = branchRepo.create({ name: defaultBranchName, description: 'Default school branch' });
    await branchRepo.save(branch);
  }

  const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL ?? 'admin@example.com';
  const existingAdmin = await adminRepo.findOne({ where: { email: defaultAdminEmail } });
  if (!existingAdmin) {
    const role = await roleRepo.findOneBy({ name: 'admin' });
    if (!role) throw new Error('Admin role missing');

    const password = process.env.DEFAULT_ADMIN_PASSWORD ?? 'ChangeMe123!';
    const passwordHash = await hashPassword(password);

    const admin = adminRepo.create({
      name: 'Admin',
      email: defaultAdminEmail,
      passwordHash,
      role,
      branch
    });
    await adminRepo.save(admin);
  }
}
