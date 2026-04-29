import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  const processes = db
    .prepare('SELECT * FROM processes ORDER BY rowid ASC')
    .all();
  return NextResponse.json(processes);
}
