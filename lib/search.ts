import db from './db';
import { embed, embedBatch, cosineSimilarity } from './embeddings';

export interface ProcessRow {
  id: string;
  origin_country: string;
  destination_country: string;
  product: string;
  status: string;
  estimated_arrival: string;
}

interface ProcessRowWithEmbedding extends ProcessRow {
  embedding: string | null;
}

export interface ScoredProcess extends ProcessRow {
  score: number;
}

export function processToText(p: ProcessRow): string {
  return `${p.id} - Origem: ${p.origin_country}, Destino: ${p.destination_country}, Produto: ${p.product}, Status: ${p.status}, Previsão de chegada: ${p.estimated_arrival}`;
}

export async function ensureProcessEmbeddings(): Promise<number> {
  const missing = db
    .prepare(
      "SELECT id, origin_country, destination_country, product, status, estimated_arrival FROM processes WHERE embedding IS NULL OR embedding = ''"
    )
    .all() as ProcessRow[];

  if (missing.length === 0) return 0;

  console.log(`[RAG] Generating embeddings for ${missing.length} processes...`);
  const texts = missing.map(processToText);
  const embeddings = await embedBatch(texts);

  const update = db.prepare('UPDATE processes SET embedding = ? WHERE id = ?');
  const tx = db.transaction(() => {
    for (let i = 0; i < missing.length; i++) {
      update.run(JSON.stringify(embeddings[i]), missing[i].id);
    }
  });
  tx();

  console.log(`[RAG] Stored ${missing.length} embeddings.`);
  return missing.length;
}

export async function semanticSearch(query: string, topK = 8): Promise<ScoredProcess[]> {
  await ensureProcessEmbeddings();

  const queryEmbedding = await embed(query);

  const all = db
    .prepare(
      'SELECT id, origin_country, destination_country, product, status, estimated_arrival, embedding FROM processes WHERE embedding IS NOT NULL'
    )
    .all() as ProcessRowWithEmbedding[];

  const scored: ScoredProcess[] = all.map((p) => ({
    id: p.id,
    origin_country: p.origin_country,
    destination_country: p.destination_country,
    product: p.product,
    status: p.status,
    estimated_arrival: p.estimated_arrival,
    score: cosineSimilarity(queryEmbedding, JSON.parse(p.embedding!)),
  }));

  return scored.sort((a, b) => b.score - a.score).slice(0, topK);
}

export function getProcessesByIds(ids: string[]): ProcessRow[] {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(',');
  return db
    .prepare(
      `SELECT id, origin_country, destination_country, product, status, estimated_arrival FROM processes WHERE id IN (${placeholders})`
    )
    .all(...ids) as ProcessRow[];
}

export function extractJjoIds(text: string): string[] {
  const matches = text.matchAll(/JJO\d+/gi);
  return [...new Set([...matches].map((m) => m[0].toUpperCase()))];
}
