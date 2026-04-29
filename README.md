# ComexPro — AI Chatbot Website

Website de comércio exterior com chatbot de IA integrado, rastreamento de processos JJO e busca semântica via RAG.

## Requisitos

| Ferramenta | Versão mínima | Download |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | (vem junto com o Node.js) |
| Chave de API OpenAI | — | https://platform.openai.com/api-keys |

## Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/NeiJr19/chatBot.git
cd chatBot
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:
```
OPENAI_API_KEY=sk-...sua_chave_aqui...
```

> O arquivo `.env.example` serve de modelo. Basta copiá-lo e renomear para `.env.local`.

### 4. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Dependências do Projeto

Todas gerenciadas automaticamente pelo `npm install` via `package.json`:

| Pacote | Versão | Finalidade |
|---|---|---|
| next | ^15.3.1 | Framework React (frontend + backend) |
| react | ^19.0.0 | Interface do usuário |
| react-dom | ^19.0.0 | Renderização React |
| openai | ^4.98.0 | SDK da OpenAI (chat + embeddings) |
| better-sqlite3 | ^11.9.1 | Banco de dados SQLite local |
| tailwindcss | ^4 | Estilização CSS |
| typescript | ^5 | Tipagem estática |

## Banco de Dados

O banco SQLite (`chatbot.db`) é criado automaticamente na primeira execução. Não é necessário instalar nenhum banco de dados separado.

Na primeira inicialização:
- 150 processos JJO são inseridos automaticamente
- Na primeira mensagem do chat, os embeddings semânticos são gerados via OpenAI (uma única chamada em batch)

## Scripts disponíveis

```bash
npm run dev      # Servidor de desenvolvimento (http://localhost:3000)
npm run build    # Build de produção
npm run start    # Servidor de produção (requer build antes)
npm run lint     # Verificação de código
```

## Estrutura do Projeto

```
chatBot/
├── app/
│   ├── api/
│   │   ├── conversations/     # CRUD de conversas
│   │   ├── messages/          # Envio de mensagens + RAG + OpenAI
│   │   └── processes/         # Listagem dos processos JJO
│   ├── processos/             # Página /processos (tabela JJO)
│   ├── layout.tsx             # Layout global (inclui ChatWidget)
│   └── page.tsx               # Landing page ComexPro
├── components/
│   └── ChatWidget.tsx         # Botão flutuante + painel de chat
├── lib/
│   ├── db.ts                  # Configuração SQLite + seed de dados
│   ├── embeddings.ts          # Helpers OpenAI embeddings + cosine similarity
│   └── search.ts              # Busca semântica RAG + filtros por status/ID
├── .env.example               # Modelo de variáveis de ambiente
├── package.json               # Dependências e scripts
└── README.md                  # Este arquivo
```
