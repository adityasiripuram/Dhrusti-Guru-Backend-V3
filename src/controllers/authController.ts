import { Request, Response } from 'express';
import { loginUser, registerAdmin } from '../services/authService';

export async function loginController(req: Request, res: Response) {
  const { email, password } = req.body;
  const result = await loginUser(email, password);
  return res.json(result);
}

export async function signupController(req: Request, res: Response) {
  const { name, email, password, branchId } = req.body;
  const user = await registerAdmin(name, email, password, branchId);
  return res.status(201).json({
    id: user.id,
    email: user.email,
    name: user.name
  });
}

export async function refreshTokenController(req: Request, res: Response) {
  // TODO: implement refresh token logic for production
  return res.status(501).json({ message: 'Not implemented' });
}
