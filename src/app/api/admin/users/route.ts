import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getPool, sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const search = request.nextUrl.searchParams.get('search')?.trim() || '';

  const pool = await getPool();
  const req = pool.request();

  let query = `
    SELECT Id, Email, DisplayName, ProfilePictureUrl, Roles,
           IsActive, LastLoginAt, CreatedAt
    FROM ltp.Users
  `;

  if (search) {
    query += ` WHERE DisplayName LIKE @search OR Email LIKE @search`;
    req.input('search', sql.NVarChar, `%${search}%`);
  }

  query += ` ORDER BY CreatedAt DESC`;

  const result = await req.query(query);

  const users = result.recordset.map((row) => ({
    id: row.Id,
    email: row.Email,
    displayName: row.DisplayName,
    picture: row.ProfilePictureUrl,
    roles: parseRoles(row.Roles),
    isActive: row.IsActive,
    lastLoginAt: row.LastLoginAt,
    createdAt: row.CreatedAt,
  }));

  return NextResponse.json({ users });
}

function parseRoles(rolesJson: string): string[] {
  try {
    return JSON.parse(rolesJson);
  } catch {
    return [];
  }
}
