'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Process {
  id: string;
  origin_country: string;
  destination_country: string;
  product: string;
  status: string;
  estimated_arrival: string;
}

const statusStyle: Record<string, string> = {
  'Em trânsito':            'bg-blue-100 text-blue-700',
  'Aguardando desembaraço': 'bg-yellow-100 text-yellow-700',
  'Entregue':               'bg-green-100 text-green-700',
  'Em processamento':       'bg-purple-100 text-purple-700',
  'Retido na alfândega':    'bg-red-100 text-red-700',
  'Documentação pendente':  'bg-orange-100 text-orange-700',
};

function fmt(date: string) {
  const [y, m, d] = date.split('-');
  return `${d}/${m}/${y}`;
}

export default function ProcessosPage() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetch('/api/processes')
      .then((r) => r.json())
      .then(setProcesses);
  }, []);

  const allStatuses = [...new Set(processes.map((p) => p.status))].sort();

  const filtered = processes.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.id.toLowerCase().includes(q) ||
      p.origin_country.toLowerCase().includes(q) ||
      p.destination_country.toLowerCase().includes(q) ||
      p.product.toLowerCase().includes(q);
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: processes.length,
    transito: processes.filter((p) => p.status === 'Em trânsito').length,
    entregue: processes.filter((p) => p.status === 'Entregue').length,
    pendente: processes.filter(
      (p) => p.status === 'Retido na alfândega' || p.status === 'Documentação pendente'
    ).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-500 hover:text-blue-600 text-sm flex items-center gap-1 transition-colors"
            >
              ← Início
            </Link>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                CP
              </div>
              <span className="font-semibold text-gray-900">Processos JJO</span>
            </div>
          </div>
          <span className="text-xs text-gray-400">{processes.length} processos cadastrados</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: counts.total, color: 'text-gray-700', bg: 'bg-white' },
            { label: 'Em trânsito', value: counts.transito, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Entregues', value: counts.entregue, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Requerem atenção', value: counts.pendente, color: 'text-red-600', bg: 'bg-red-50' },
          ].map((card) => (
            <div
              key={card.label}
              className={`${card.bg} border border-gray-200 rounded-xl p-4 text-center`}
            >
              <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <input
            type="text"
            placeholder="Buscar por código, país ou produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[220px] border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
          >
            <option value="">Todos os status</option>
            {allStatuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {(search || statusFilter) && (
            <button
              onClick={() => { setSearch(''); setStatusFilter(''); }}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors px-2"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-600 w-24">Código</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Origem</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Destino</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Produto</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-right">Previsão</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400">
                      Nenhum processo encontrado.
                    </td>
                  </tr>
                )}
                {filtered.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`border-b border-gray-100 hover:bg-blue-50/40 transition-colors ${
                      i % 2 === 0 ? '' : 'bg-gray-50/50'
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-semibold text-blue-700">{p.id}</td>
                    <td className="px-4 py-3 text-gray-700">{p.origin_country}</td>
                    <td className="px-4 py-3 text-gray-700">{p.destination_country}</td>
                    <td className="px-4 py-3 text-gray-600">{p.product}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusStyle[p.status] ?? 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 tabular-nums">
                      {fmt(p.estimated_arrival)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400">
            Exibindo {filtered.length} de {processes.length} processos
          </div>
        </div>
      </main>
    </div>
  );
}
