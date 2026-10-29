import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto';
const derivar = (password: string, salt: string) =>
  new Promise<Buffer>((resolve, reject) =>
    scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (error, key) =>
      error ? reject(error) : resolve(key),
    ),
  );
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  return `scrypt:${salt}:${(await derivar(password, salt)).toString('hex')}`;
}
export async function verificarPassword(password: string, hash: string) {
  const [, salt, key] = hash.split(':');
  const calculado = await derivar(password, salt);
  const original = Buffer.from(key, 'hex');
  return original.length === calculado.length && timingSafeEqual(original, calculado);
}
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
export const nuevoToken = () => randomBytes(32).toString('hex');
