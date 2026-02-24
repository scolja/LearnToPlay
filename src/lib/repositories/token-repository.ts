import { getPool, sql } from '../db';
import crypto from 'crypto';

export interface DbRefreshToken {
  Id: string;
  UserId: string;
  Token: string;
  ExpiresAt: Date;
  CreatedAt: Date;
  RevokedAt: Date | null;
}

export async function createRefreshToken(userId: string, expiresInDays = 30): Promise<string> {
  const pool = await getPool();
  const token = crypto.randomBytes(64).toString('base64url');
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

  await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .input('token', sql.NVarChar, token)
    .input('expiresAt', sql.DateTime2, expiresAt)
    .query(`
      INSERT INTO ltp.RefreshTokens (UserId, Token, ExpiresAt)
      VALUES (@userId, @token, @expiresAt)
    `);

  return token;
}

export async function findValidRefreshToken(token: string): Promise<DbRefreshToken | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('token', sql.NVarChar, token)
    .query<DbRefreshToken>(`
      SELECT * FROM ltp.RefreshTokens
      WHERE Token = @token AND RevokedAt IS NULL AND ExpiresAt > GETUTCDATE()
    `);
  return result.recordset[0] ?? null;
}

export async function revokeRefreshToken(token: string): Promise<void> {
  const pool = await getPool();
  await pool.request()
    .input('token', sql.NVarChar, token)
    .query(`
      UPDATE ltp.RefreshTokens
      SET RevokedAt = GETUTCDATE()
      WHERE Token = @token
    `);
}

export async function revokeAllUserTokens(userId: string): Promise<void> {
  const pool = await getPool();
  await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .query(`
      UPDATE ltp.RefreshTokens
      SET RevokedAt = GETUTCDATE()
      WHERE UserId = @userId AND RevokedAt IS NULL
    `);
}
