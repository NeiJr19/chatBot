import Link from 'next/link';

const services = [
  {
    icon: '📦',
    title: 'Importação',
    desc: 'Gestão completa do processo de importação: licenciamento, despacho aduaneiro, transporte e entrega.',
  },
  {
    icon: '🚢',
    title: 'Exportação',
    desc: 'Suporte especializado para exportação, incluindo NCM, documentação, RADAR e câmbio.',
  },
  {
    icon: '📋',
    title: 'Consultoria Aduaneira',
    desc: 'Orientação sobre legislação, regimes especiais, drawback e classificação fiscal.',
  },
  {
    icon: '💱',
    title: 'Câmbio',
    desc: 'Assessoria em fechamento de câmbio, contratos e conformidade com Banco Central.',
  },
  {
    icon: '🏭',
    title: 'Regimes Especiais',
    desc: 'Habilitação e gestão de RECOF, entreposto aduaneiro e exportação temporária.',
  },
  {
    icon: '📊',
    title: 'Inteligência Comercial',
    desc: 'Análise de mercados internacionais, identificação de oportunidades e benchmarking.',
  },
];

const stats = [
  { value: '2.400+', label: 'Operações por ano' },
  { value: '68', label: 'Países atendidos' },
  { value: '15 anos', label: 'De experiência' },
  { value: '99%', label: 'Satisfação' },
];

const differentials = [
  'Equipe certificada pela Receita Federal',
  'Rastreamento de cargas em tempo real',
  'Atendimento personalizado para cada cliente',
  'Escritórios em São Paulo, Rio e Curitiba',
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              CP
            </div>
            <span className="font-semibold text-gray-900 text-lg">ComexPro</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#servicos" className="hover:text-blue-600 transition-colors">Serviços</a>
            <a href="#sobre" className="hover:text-blue-600 transition-colors">Sobre</a>
            <a href="#contato" className="hover:text-blue-600 transition-colors">Contato</a>
            <Link
              href="/processos"
              className="text-blue-600 font-semibold hover:text-blue-800 transition-colors"
            >
              Processos JJO
            </Link>
          </nav>
          <a
            href="#contato"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Fale conosco
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <span className="bg-blue-500/30 text-blue-200 text-xs font-medium px-3 py-1 rounded-full uppercase tracking-wider">
              Comércio Exterior
            </span>
            <h1 className="mt-4 text-4xl md:text-5xl font-bold leading-tight">
              Conectamos o Brasil<br />ao mundo
            </h1>
            <p className="mt-4 text-blue-100 text-lg leading-relaxed">
              Soluções completas em importação, exportação e consultoria aduaneira para empresas
              que querem crescer além das fronteiras.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#servicos"
                className="bg-white text-blue-700 hover:bg-blue-50 font-medium px-6 py-3 rounded-lg text-sm transition-colors"
              >
                Nossos serviços
              </a>
              <a
                href="#contato"
                className="border border-blue-300 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg text-sm transition-colors"
              >
                Solicitar cotação
              </a>
              <Link
                href="/processos"
                className="bg-blue-500/20 hover:bg-blue-500/30 text-white font-medium px-6 py-3 rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <span>📋</span> Ver Processos JJO
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="servicos" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-900">Nossos Serviços</h2>
        <p className="text-center text-gray-500 mt-2 text-sm">
          Tudo que você precisa para operar no comércio exterior
        </p>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.title}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-blue-200 transition-all"
            >
              <p className="text-3xl">{service.icon}</p>
              <h3 className="font-semibold text-gray-900 mt-3">{service.title}</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="sobre" className="bg-blue-700 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold">Por que a ComexPro?</h2>
            <p className="mt-4 text-blue-100 text-sm leading-relaxed">
              Desde 2009, ajudamos empresas brasileiras a navegar com segurança no comércio
              internacional. Nossa equipe de especialistas está pronta para simplificar processos
              complexos e reduzir custos operacionais.
            </p>
            <ul className="mt-6 space-y-2">
              {differentials.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-blue-100">
                  <span className="text-green-400 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-blue-600/50 rounded-2xl p-8 text-center">
            <p className="text-5xl font-bold">R$ 2,3 bi</p>
            <p className="text-blue-200 text-sm mt-2">em operações gerenciadas em 2024</p>
            <div className="border-t border-blue-500 mt-6 pt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold">340+</p>
                <p className="text-blue-200 text-xs">Clientes ativos</p>
              </div>
              <div>
                <p className="text-2xl font-bold">ISO 9001</p>
                <p className="text-blue-200 text-xs">Certificado</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contato" className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Pronto para expandir seu negócio?</h2>
        <p className="text-gray-500 mt-2 text-sm">
          Entre em contato ou use o assistente no canto inferior direito para tirar suas dúvidas agora.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="mailto:contato@comexpro.com.br"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
          >
            Enviar e-mail
          </a>
          <a
            href="tel:+551140020502"
            className="border border-gray-300 hover:border-blue-400 text-gray-700 hover:text-blue-600 px-6 py-3 rounded-lg text-sm font-medium transition-colors"
          >
            (11) 4002-0502
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-sm">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-wrap justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-white mb-2">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-xs font-bold">
                CP
              </div>
              <span className="font-semibold">ComexPro</span>
            </div>
            <p className="text-xs">CNPJ: 12.345.678/0001-90</p>
            <p className="text-xs">Av. Paulista, 1000 — São Paulo, SP</p>
          </div>
          <div className="flex gap-10">
            <div>
              <p className="text-white font-medium mb-2 text-xs">Serviços</p>
              <ul className="space-y-1 text-xs">
                <li>Importação</li>
                <li>Exportação</li>
                <li>Consultoria</li>
                <li>Câmbio</li>
              </ul>
            </div>
            <div>
              <p className="text-white font-medium mb-2 text-xs">Contato</p>
              <ul className="space-y-1 text-xs">
                <li>contato@comexpro.com.br</li>
                <li>(11) 4002-0502</li>
                <li>Seg–Sex 8h–18h</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 text-center py-4 text-xs">
          © 2024 ComexPro. Todos os direitos reservados.
        </div>
      </footer>

    </div>
  );
}
