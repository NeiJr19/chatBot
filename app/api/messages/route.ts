import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import db from '@/lib/db';
import { randomUUID } from 'crypto';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type ProcessRow = {
  id: string;
  origin_country: string;
  destination_country: string;
  product: string;
  status: string;
  estimated_arrival: string;
};

function buildProcessesContext(): string {
  const rows = db
    .prepare('SELECT * FROM processes ORDER BY rowid ASC')
    .all() as ProcessRow[];

  const lines = rows.map(
    (p) =>
      `${p.id} | ${p.origin_country} → ${p.destination_country} | ${p.product} | ${p.status} | Chegada: ${p.estimated_arrival}`
  );

  return `\n\nBase de dados atual dos processos JJO da ComexPro:\n${lines.join('\n')}`;
}

export async function POST(req: NextRequest) {
  const { conversationId, message } = await req.json();

  if (!conversationId || !message?.trim()) {
    return NextResponse.json(
      { error: 'conversationId and message are required' },
      { status: 400 }
    );
  }

  const userMsgId = randomUUID();
  db.prepare(
    'INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)'
  ).run(userMsgId, conversationId, 'user', message.trim());

  const { n } = db
    .prepare('SELECT COUNT(*) as n FROM messages WHERE conversation_id = ?')
    .get(conversationId) as { n: number };
  if (n === 1) {
    db.prepare('UPDATE conversations SET title = ? WHERE id = ?').run(
      message.trim().slice(0, 60),
      conversationId
    );
  }

  const history = db
    .prepare(
      'SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 20'
    )
    .all(conversationId) as { role: string; content: string }[];

  const systemPrompt =
    'Você é o assistente virtual da ComexPro, empresa especializada em comércio exterior. ' +
    'Ajude os usuários com dúvidas sobre importação, exportação, despacho aduaneiro, classificação NCM, ' +
    'regimes especiais (drawback, RECOF, entreposto), câmbio, documentação (LI, DI, RE, DDE), ' +
    'RADAR, SISCOMEX e legislação aduaneira brasileira. ' +
    'Você também tem acesso em tempo real aos processos JJO da empresa listados abaixo. ' +
    'Quando perguntado sobre um processo específico ou sobre a lista, use esses dados para responder com precisão. ' +
    'Seja claro, objetivo e profissional. Responda sempre em português.' +
    buildProcessesContext();

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      ...history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ],
    stream: true,
  });

  const assistantMsgId = randomUUID();
  let fullContent = '';

  const readable = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? '';
        if (delta) {
          fullContent += delta;
          controller.enqueue(enc.encode(delta));
        }
      }
      db.prepare(
        'INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)'
      ).run(assistantMsgId, conversationId, 'assistant', fullContent);
      db.prepare(
        'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(conversationId);
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
