import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getPool, sql } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await request.json();
  const isActive: boolean = body.isActive;

  if (typeof isActive !== 'boolean') {
    return NextResponse.json(
      { error: 'isActive must be a boolean' },
      { status: 400 }
    );
  }

  // Prevent admin from deactivating themselves
  if (id === auth.sub && !isActive) {
    return NextResponse.json(
      { error: 'Cannot deactivate your own account' },
      { status: 400 }
    );
  }

  const pool = await getPool();

  await pool.request()
    .input('id', sql.UniqueIdentifier, id)
    .input('isActive', sql.Bit, isActive)
    .query(`
      UPDATE ltp.Users
      SET IsActive = @isActive, UpdatedAt = GETUTCDATE()
      WHERE Id = @id
    `);

  return NextResponse.json({ success: true, isActive });
}
