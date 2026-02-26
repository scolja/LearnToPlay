import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getPool, sql } from '@/lib/db';

const ALLOWED_ROLES = ['editor', 'admin'];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await request.json();
  const roles: string[] = body.roles;

  if (!Array.isArray(roles) || roles.some((r) => !ALLOWED_ROLES.includes(r))) {
    return NextResponse.json(
      { error: `Invalid roles. Allowed: ${ALLOWED_ROLES.join(', ')}` },
      { status: 400 }
    );
  }

  // Prevent admin from removing their own admin role
  if (id === auth.sub && !roles.includes('admin')) {
    return NextResponse.json(
      { error: 'Cannot remove your own admin role' },
      { status: 400 }
    );
  }

  const pool = await getPool();
  const rolesJson = JSON.stringify(roles);

  await pool.request()
    .input('id', sql.UniqueIdentifier, id)
    .input('roles', sql.NVarChar, rolesJson)
    .query(`
      UPDATE ltp.Users
      SET Roles = @roles, UpdatedAt = GETUTCDATE()
      WHERE Id = @id
    `);

  return NextResponse.json({ success: true, roles });
}
