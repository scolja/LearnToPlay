import { getPool, sql } from '../db';

export interface DbUser {
  Id: string;
  Email: string;
  DisplayName: string;
  GoogleId: string | null;
  ProfilePictureUrl: string | null;
  Roles: string;
  IsActive: boolean;
  LastLoginAt: Date | null;
  CreatedAt: Date;
  UpdatedAt: Date;
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('email', sql.NVarChar, email)
    .query<DbUser>('SELECT * FROM ltp.Users WHERE Email = @email');
  return result.recordset[0] ?? null;
}

export async function findUserByGoogleId(googleId: string): Promise<DbUser | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('googleId', sql.NVarChar, googleId)
    .query<DbUser>('SELECT * FROM ltp.Users WHERE GoogleId = @googleId');
  return result.recordset[0] ?? null;
}

export async function findUserById(id: string): Promise<DbUser | null> {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.UniqueIdentifier, id)
    .query<DbUser>('SELECT * FROM ltp.Users WHERE Id = @id');
  return result.recordset[0] ?? null;
}

export async function createUser(user: {
  email: string;
  displayName: string;
  googleId: string;
  profilePictureUrl?: string;
}): Promise<DbUser> {
  const pool = await getPool();
  const result = await pool.request()
    .input('email', sql.NVarChar, user.email)
    .input('displayName', sql.NVarChar, user.displayName)
    .input('googleId', sql.NVarChar, user.googleId)
    .input('profilePictureUrl', sql.NVarChar, user.profilePictureUrl ?? null)
    .query<DbUser>(`
      INSERT INTO ltp.Users (Email, DisplayName, GoogleId, ProfilePictureUrl)
      OUTPUT INSERTED.*
      VALUES (@email, @displayName, @googleId, @profilePictureUrl)
    `);
  return result.recordset[0];
}

export async function updateUserLogin(id: string, updates: {
  displayName?: string;
  profilePictureUrl?: string;
  googleId?: string;
}): Promise<void> {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.UniqueIdentifier, id)
    .input('displayName', sql.NVarChar, updates.displayName ?? null)
    .input('profilePictureUrl', sql.NVarChar, updates.profilePictureUrl ?? null)
    .input('googleId', sql.NVarChar, updates.googleId ?? null)
    .query(`
      UPDATE ltp.Users
      SET LastLoginAt = GETUTCDATE(),
          UpdatedAt = GETUTCDATE(),
          DisplayName = COALESCE(@displayName, DisplayName),
          ProfilePictureUrl = COALESCE(@profilePictureUrl, ProfilePictureUrl),
          GoogleId = COALESCE(@googleId, GoogleId)
      WHERE Id = @id
    `);
}

export function parseRoles(rolesJson: string): string[] {
  try {
    return JSON.parse(rolesJson);
  } catch {
    return [];
  }
}

export function hasRole(user: DbUser, role: string): boolean {
  return parseRoles(user.Roles).includes(role);
}
