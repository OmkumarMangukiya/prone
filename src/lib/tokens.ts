import jwt, { SignOptions } from 'jsonwebtoken';

const SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret';

export interface TokenPayload {
    email: string;
    type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';
    exp?: number;
}

export function generateToken(payload: Omit<TokenPayload, 'exp'>, expiresIn: string | number = '1h'): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: SignOptions = { expiresIn: expiresIn as any };
    return jwt.sign(payload, SECRET, options);
}

export function verifyToken(token: string): TokenPayload | null {
    try {
        return jwt.verify(token, SECRET) as TokenPayload;
    } catch {
        return null;
    }
}
