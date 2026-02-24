import { NextResponse } from 'next/server';
import { listVersions } from '@/lib/repositories/guide-repository';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const versions = await listVersions(slug);
    return NextResponse.json({ versions });
  } catch (err) {
    console.error('List versions error:', err);
    return NextResponse.json({ error: 'Failed to list versions' }, { status: 500 });
  }
}
