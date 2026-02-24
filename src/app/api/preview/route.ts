import { NextResponse } from 'next/server';
import { serialize } from 'next-mdx-remote/serialize';

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    if (typeof content !== 'string') {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 });
    }

    const result = await serialize(content);
    return NextResponse.json({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Compilation failed';
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
