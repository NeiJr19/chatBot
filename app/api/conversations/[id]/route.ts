import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const conversation = db.prepare('SELECT * FROM conversations WHERE id = ?').get(id);
  if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const messages = db
    .prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC')
    .all(id);

  return NextResponse.json({ ...conversation, messages });
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  db.prepare('DELETE FROM conversations WHERE id = ?').run(id);
  return new NextResponse(null, { status: 204 });
}
