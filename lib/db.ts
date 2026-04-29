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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const { n } = db.prepare('SELECT COUNT(*) as n FROM processes').get() as { n: number };

if (n === 0) {
  const seed = db.prepare(
    'INSERT INTO processes (id, origin_country, destination_country, product, status, estimated_arrival) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const rows: [string, string, string, string, string, string][] = [
    ['JJO1',  'China',           'Brasil',          'Componentes eletrônicos',  'Em trânsito',              '2026-05-10'],
    ['JJO2',  'Brasil',          'Argentina',        'Autopeças',                'Entregue',                 '2026-04-15'],
    ['JJO3',  'Alemanha',        'Brasil',           'Maquinário industrial',    'Aguardando desembaraço',   '2026-05-03'],
    ['JJO4',  'Brasil',          'Chile',            'Alimentos processados',    'Em trânsito',              '2026-05-07'],
    ['JJO5',  'Estados Unidos',  'Brasil',           'Equipamentos médicos',     'Em processamento',         '2026-05-20'],
    ['JJO6',  'Brasil',          'Colômbia',         'Têxteis e confecções',     'Entregue',                 '2026-04-20'],
    ['JJO7',  'Japão',           'Brasil',           'Instrumentos de precisão', 'Aguardando desembaraço',   '2026-05-05'],
    ['JJO8',  'China',           'Brasil',           'Matéria-prima plástica',   'Retido na alfândega',      '2026-04-28'],
    ['JJO9',  'Brasil',          'México',           'Produtos químicos',        'Em trânsito',              '2026-05-15'],
    ['JJO10', 'Coreia do Sul',   'Brasil',           'Componentes eletrônicos',  'Em trânsito',              '2026-05-25'],
    ['JJO11', 'Brasil',          'Estados Unidos',   'Calçados e couros',        'Documentação pendente',    '2026-05-12'],
    ['JJO12', 'Índia',           'Brasil',           'Têxteis e confecções',     'Em trânsito',              '2026-05-30'],
    ['JJO13', 'Brasil',          'Portugal',         'Alimentos processados',    'Entregue',                 '2026-04-10'],
    ['JJO14', 'Vietnam',         'Brasil',           'Móveis e decoração',       'Em processamento',         '2026-06-05'],
    ['JJO15', 'Brasil',          'Alemanha',         'Minério de ferro',         'Em trânsito',              '2026-05-18'],
    ['JJO16', 'França',          'Brasil',           'Vinhos e bebidas',         'Aguardando desembaraço',   '2026-05-02'],
    ['JJO17', 'Brasil',          'Japão',            'Soja e grãos',             'Entregue',                 '2026-04-05'],
    ['JJO18', 'Taiwan',          'Brasil',           'Semicondutores',           'Em trânsito',              '2026-06-10'],
    ['JJO19', 'Brasil',          'Chile',            'Papel e celulose',         'Em processamento',         '2026-05-22'],
    ['JJO20', 'Países Baixos',   'Brasil',           'Fertilizantes',            'Retido na alfândega',      '2026-05-01'],
    ['JJO21', 'Brasil',          'China',            'Minério de ferro',         'Em trânsito',              '2026-05-28'],
    ['JJO22', 'Espanha',         'Brasil',           'Maquinário agrícola',      'Aguardando desembaraço',   '2026-05-08'],
    ['JJO23', 'Brasil',          'Argentina',        'Produtos químicos',        'Entregue',                 '2026-04-18'],
    ['JJO24', 'México',          'Brasil',           'Autopeças',                'Em trânsito',              '2026-06-01'],
    ['JJO25', 'Brasil',          'Países Baixos',    'Carnes processadas',       'Em processamento',         '2026-05-14'],
    ['JJO26', 'Emirados Árabes', 'Brasil',           'Petroquímicos',            'Documentação pendente',    '2026-05-17'],
    ['JJO27', 'Brasil',          'Coreia do Sul',    'Celulose',                 'Em trânsito',              '2026-06-08'],
    ['JJO28', 'Itália',          'Brasil',           'Equipamentos médicos',     'Entregue',                 '2026-04-25'],
    ['JJO29', 'Brasil',          'França',           'Café e cacau',             'Em trânsito',              '2026-05-20'],
    ['JJO30', 'China',           'Brasil',           'Borracha sintética',       'Aguardando desembaraço',   '2026-06-15'],
  ];

  const insertMany = db.transaction(() => {
    for (const row of rows) seed.run(...row);
  });
  insertMany();
}

export default db;
