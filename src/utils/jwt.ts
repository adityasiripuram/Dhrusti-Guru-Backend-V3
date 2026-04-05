import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  branchId?: string;
}

const JWT_SECRET = process.env.JWT_SECRET ?? 'default-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET as any, { expiresIn: JWT_EXPIRES_IN } as any);
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET as any, { expiresIn: JWT_REFRESH_EXPIRES_IN } as any);
}

export function verifyToken<T = JwtPayload>(token: string): T {
  return jwt.verify(token, JWT_SECRET as jwt.Secret) as T;
}
