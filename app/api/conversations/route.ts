import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET() {
  const conversations = db
    .prepare('SELECT * FROM conversations ORDER BY updated_at DESC')
    .all();
  return NextResponse.json(conversations);
}

export async function POST() {
  const id = randomUUID();
  db.prepare('INSERT INTO conversations (id, title) VALUES (?, ?)').run(id, 'Nova conversa');
  const conv = db.prepare('SELECT * FROM conversations WHERE id = ?').get(id);
  return NextResponse.json(conv, { status: 201 });
}
