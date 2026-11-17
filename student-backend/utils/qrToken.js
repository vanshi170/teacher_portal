import { createHash, randomBytes } from 'node:crypto';

export function createQrToken() {
  const token = randomBytes(32).toString('base64url');
  return { token, tokenHash: hashQrToken(token) };
}

export function hashQrToken(token) {
  return createHash('sha256').update(token).digest('hex');
}
