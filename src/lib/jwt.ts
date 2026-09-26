import jwt from 'jsonwebtoken';

export type AdminPayload = { id: string; userId: string };
function secret() { const value = process.env.JWT_SECRET; if (!value) throw new Error('JWT_SECRET is not set'); return value; }
export function signToken(payload: AdminPayload) { return jwt.sign(payload, secret(), { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'] }); }
export function verifyToken(token: string) { return jwt.verify(token, secret()) as AdminPayload; }
