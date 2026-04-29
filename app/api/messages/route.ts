import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import db from '@/lib/db';
import {
  semanticSearch,
  getProcessesByIds,
  processToText,
  extractJjoIds,
} from '@/lib/search';
import { randomUUID } from 'crypto';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function buildRagContext(query: string): Promise<string> {
  try {
    const explicitIds = extractJjoIds(query);
    const explicit = getProcessesByIds(explicitIds);
    const explicitSet = new Set(explicit.map((p) => p.id));

    const semantic = await semanticSearch(query, 8);
    const semanticOnly = semantic.filter((p) => !explicitSet.has(p.id));

    const lines: string[] = [];

    if (explicit.length > 0) {
      lines.push('Processos mencionados explicitamente pelo usuário:');
      for (const p of explicit) lines.push(`  ${processToText(p)}`);
    }

    if (semanticOnly.length > 0) {
      lines.push('Processos relacionados (busca semântica por similaridade):');
      for (const p of semanticOnly) {
        lines.push(`  ${processToText(p)} [relevância: ${p.score.toFixed(2)}]`);
      }
    }

    if (lines.length === 0) return '';

    console.log(
      `[RAG] explicit=${explicit.length} semantic=${semanticOnly.length} top_score=${semantic[0]?.score.toFixed(3) ?? 'n/a'}`
    );

    return '\n\n--- CONTEXTO RAG ---\n' + lines.join('\n');
  } catch (err) {
    console.error('[RAG] Failed to build context:', err);
    return '';
  }
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

  const ragContext = await buildRagContext(message);

  const systemPrompt =
    'Você é o assistente virtual da ComexPro, empresa especializada em comércio exterior. ' +
    'Ajude os usuários com dúvidas sobre importação, exportação, despacho aduaneiro, classificação NCM, ' +
    'regimes especiais (drawback, RECOF, entreposto), câmbio, documentação (LI, DI, RE, DDE), ' +
    'RADAR, SISCOMEX e legislação aduaneira brasileira. ' +
    'Você tem acesso a uma seleção dos processos JJO mais relevantes para cada consulta, recuperados ' +
    'por busca semântica e por match exato de código. Use APENAS os processos listados no contexto RAG ' +
    'para responder perguntas sobre processos específicos. Se um processo não aparecer no contexto, ' +
    'informe que não foi encontrado entre os processos relevantes. ' +
    'Seja claro, objetivo e profissional. Responda sempre em português.' +
    ragContext;

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
