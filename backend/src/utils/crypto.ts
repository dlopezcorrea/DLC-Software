import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString('hex');
}
