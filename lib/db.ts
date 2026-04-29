import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'chatbot.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'Nova conversa',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS processes (
    id TEXT PRIMARY KEY,
    origin_country TEXT NOT NULL,
    destination_country TEXT NOT NULL,
    product TEXT NOT NULL,
    status TEXT NOT NULL,
    estimated_arrival DATE NOT NULL,
    embedding TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const cols = db.prepare("PRAGMA table_info(processes)").all() as { name: string }[];
if (!cols.some((c) => c.name === 'embedding')) {
  db.exec('ALTER TABLE processes ADD COLUMN embedding TEXT');
}

const TARGET_COUNT = 150;
const { n } = db.prepare('SELECT COUNT(*) as n FROM processes').get() as { n: number };

if (n < TARGET_COUNT) {
  const importPartners = [
    'China', 'Estados Unidos', 'Alemanha', 'Japão', 'Coreia do Sul', 'Itália',
    'França', 'Espanha', 'Reino Unido', 'Países Baixos', 'Bélgica', 'Suíça',
    'Polônia', 'Índia', 'Vietnam', 'Taiwan', 'Singapura', 'Tailândia',
    'Indonésia', 'Emirados Árabes', 'Israel', 'Turquia', 'Canadá', 'México',
  ];

  const exportPartners = [
    'China', 'Estados Unidos', 'Argentina', 'Países Baixos', 'Alemanha',
    'Japão', 'Coreia do Sul', 'Chile', 'Colômbia', 'Peru', 'Uruguai',
    'Paraguai', 'Itália', 'Espanha', 'Portugal', 'Reino Unido', 'França',
    'Bélgica', 'Egito', 'Arábia Saudita', 'Marrocos', 'Vietnam', 'Índia',
  ];

  const products = [
    'Componentes eletrônicos', 'Semicondutores', 'Smartphones', 'Notebooks',
    'Maquinário industrial', 'Compressores industriais', 'Turbinas eólicas',
    'Geradores elétricos', 'Equipamentos de solda', 'Robôs industriais',
    'Produtos químicos', 'Polímeros', 'Petroquímicos', 'Tintas industriais',
    'Fertilizantes', 'Defensivos agrícolas',
    'Café e cacau', 'Soja e grãos', 'Açúcar refinado', 'Carnes processadas',
    'Frutas in natura', 'Sucos concentrados', 'Alimentos processados',
    'Têxteis e confecções', 'Tecidos sintéticos', 'Calçados e couros',
    'Autopeças', 'Pneus', 'Sistemas de freio', 'Componentes automotivos',
    'Equipamentos médicos', 'Insumos hospitalares', 'Medicamentos',
    'Móveis e decoração', 'Cosméticos e perfumes', 'Brinquedos',
    'Materiais de construção', 'Cerâmicas industriais', 'Vidros temperados',
    'Minério de ferro', 'Bauxita', 'Cobre refinado', 'Celulose',
    'Borracha sintética', 'Aço laminado', 'Alumínio',
    'Vinhos e bebidas', 'Especiarias', 'Equipamentos de telecom',
    'Painéis solares', 'Baterias de íon-lítio',
  ];

  const statusDist = [
    { status: 'Em trânsito', weight: 35 },
    { status: 'Aguardando desembaraço', weight: 20 },
    { status: 'Entregue', weight: 25 },
    { status: 'Em processamento', weight: 10 },
    { status: 'Retido na alfândega', weight: 5 },
    { status: 'Documentação pendente', weight: 5 },
  ];

  function pickStatus(seed: number): string {
    const total = statusDist.reduce((s, x) => s + x.weight, 0);
    const r = (seed * 7919) % total;
    let acc = 0;
    for (const x of statusDist) {
      acc += x.weight;
      if (r < acc) return x.status;
    }
    return statusDist[0].status;
  }

  function pickDate(seed: number): string {
    const offset = (seed * 13) % 270;
    const d = new Date('2026-01-01T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + offset);
    return d.toISOString().slice(0, 10);
  }

  const insert = db.prepare(
    'INSERT OR IGNORE INTO processes (id, origin_country, destination_country, product, status, estimated_arrival) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const tx = db.transaction(() => {
    for (let i = 1; i <= TARGET_COUNT; i++) {
      const isExport = i % 3 === 0;
      const partner = isExport
        ? exportPartners[(i * 7) % exportPartners.length]
        : importPartners[(i * 11) % importPartners.length];

      insert.run(
        `JJO${i}`,
        isExport ? 'Brasil' : partner,
        isExport ? partner : 'Brasil',
        products[(i * 17) % products.length],
        pickStatus(i),
        pickDate(i)
      );
    }
  });
  tx();
}

export default db;
