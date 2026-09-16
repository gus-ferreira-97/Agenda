import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';
import Reveal from '../components/Reveal';
import PhoneMockupCarousel from '../components/PhoneMockupCarousel';
import api from '../services/api';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'basico' | 'profissional' | 'premium'>('profissional');

  interface PublicPlan {
    key: 'basico' | 'profissional' | 'premium';
    name: string;
    price: number;
    tagline: string;
    features: string[];
    ctaLabel: string;
    isPopular: boolean;
  }

  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    api
      .get('/public/plans')
      .then((resp) => setPlans(resp.data))
      .catch((err) => console.error('Erro ao carregar planos:', err))
      .finally(() => setLoadingPlans(false));
  }, []);

  const scrollToSection = (id: string) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-3">
          <Link to="/" className="text-lg md:text-xl font-bold text-violet-600 flex-shrink-0">
            AgendaApp
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <button onClick={() => scrollToSection('como-funciona')} className="hover:text-violet-600 transition">
              Como funciona
            </button>
            <button onClick={() => scrollToSection('planos')} className="hover:text-violet-600 transition">
              Planos
            </button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-violet-600 transition">
              Dúvidas
            </button>
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <Link
              to="/login"
              className="hidden sm:inline text-sm font-medium text-gray-700 hover:text-violet-600 transition"
            >
              Entrar
            </Link>
            <Link
              to="/cadastro"
              className="bg-violet-600 text-white text-xs md:text-sm font-medium px-4 md:px-5 py-2 md:py-2.5 rounded-full hover:bg-violet-700 transition whitespace-nowrap"
            >
              Começar grátis
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-gray-700 p-1 flex-shrink-0"
              aria-label="Abrir menu"
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <nav className="flex flex-col px-4 py-3 space-y-1 text-sm font-medium text-gray-700">
              <button onClick={() => scrollToSection('como-funciona')} className="text-left py-2.5 hover:text-violet-600 transition">
                Como funciona
              </button>
              <button onClick={() => scrollToSection('planos')} className="text-left py-2.5 hover:text-violet-600 transition">
                Planos
              </button>
              <button onClick={() => scrollToSection('faq')} className="text-left py-2.5 hover:text-violet-600 transition">
                Dúvidas
              </button>
              <Link to="/login" className="py-2.5 hover:text-violet-600 transition">
                Entrar
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Fundo decorativo suave */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-50/70 to-white" aria-hidden="true" />
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-violet-200/40 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-28 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-1.5 bg-violet-100 text-violet-700 text-xs md:text-sm font-medium px-3 py-1.5 rounded-full mb-5">
                <Sparkles className="w-3.5 h-3.5" />
                Feito para beleza, estética e bem-estar
              </span>
            </Reveal>

            <Reveal delay={100}>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-5">
                Seus clientes
                <br />
                agendam.
                <br />
                <span className="text-violet-600">Você só atende.</span>
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="text-gray-600 text-base md:text-lg mb-8 max-w-lg leading-relaxed">
                Compartilhe um único link. Seus clientes escolhem o serviço e o horário
                em segundos, sem baixar nada e sem criar conta.
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                <Link
                  to="/cadastro"
                  className="bg-violet-600 text-white px-7 py-3.5 rounded-full font-semibold hover:bg-violet-700 transition text-center shadow-lg shadow-violet-600/20"
                >
                  Criar minha agenda
                </Link>
                <p className="text-xs text-gray-500 text-center sm:text-left">
                  7 dias grátis
                  <br className="hidden sm:block" />
                  <span className="sm:hidden"> · </span>
                  Sem cartão
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200}>
            <div className="flex justify-center md:justify-end">
              <PhoneMockupCarousel
                images={[
                  { src: '/mockups/public-booking-1.png', alt: 'Escolha do profissional' },
                  { src: '/mockups/public-booking-2.png', alt: 'Escolha do serviço' },
                  { src: '/mockups/public-booking-3.png', alt: 'Escolha do horário' },
                  { src: '/mockups/public-booking-4.png', alt: 'Confirmação do agendamento' },
                ]}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="scroll-mt-20 py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal>
            <div className="max-w-2xl mb-12 md:mb-16">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                Como funciona
              </h2>
              <p className="text-gray-600 text-base md:text-lg">
                Você configura uma vez. Depois é só compartilhar o link.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {[
              {
                step: '01',
                title: 'Crie sua conta',
                description:
                  'Menos de um minuto. Você escolhe o endereço da sua agenda e pronto.',
              },
              {
                step: '02',
                title: 'Configure o negócio',
                description:
                  'Cadastre profissionais, serviços, preços e horários de atendimento.',
              },
              {
                step: '03',
                title: 'Compartilhe o link',
                description:
                  'Divulgue nas redes sociais e receba agendamentos automaticamente.',
              },
            ].map((item, index) => (
              <Reveal key={index} delay={(index + 1) * 100}>
                <div className="relative">
                  <span className="text-5xl md:text-6xl font-bold text-violet-100 block mb-4 tabular-nums">
                    {item.step}
                  </span>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Mockups */}
      <section id="mockups" className="scroll-mt-20 py-16 md:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            <Reveal>
              <div>
                <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                  O painel que organiza o seu dia
                </h2>
                <p className="text-gray-600 text-base md:text-lg mb-6 leading-relaxed">
                  Acompanhe agendamentos, gerencie profissionais, serviços e horários
                  em um só lugar.
                </p>
                <ul className="space-y-3 text-sm md:text-base text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 font-bold">·</span>
                    Agenda do dia com filtros por profissional e serviço
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 font-bold">·</span>
                    Cadastro de profissionais, serviços e variações
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 font-bold">·</span>
                    Relatórios de agendamentos e faturamento
                  </li>
                </ul>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="flex justify-center md:justify-end">
                <PhoneMockupCarousel
                  images={[
                    { src: '/mockups/admin-1.png', alt: 'Dashboard' },
                    { src: '/mockups/admin-2.png', alt: 'Agendamentos do dia' },
                    { src: '/mockups/admin-3.png', alt: 'Lista de profissionais' },
                    { src: '/mockups/admin-4.png', alt: 'Configurações' },
                  ]}
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="scroll-mt-20 py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal>
            <div className="max-w-2xl mb-12 md:mb-16">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                Planos que cabem no seu negócio
              </h2>
              <p className="text-gray-600 text-base md:text-lg">
                Comece grátis e evolua conforme sua agenda crescer.
              </p>
            </div>
          </Reveal>

          {loadingPlans ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse bg-gray-100 rounded-3xl h-96"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
              {plans.map((plan, index) => {
                const isSelected = selectedPlan === plan.key;
                return (
                  <Reveal key={plan.key} delay={(index + 1) * 100} className="h-full">
                    <div
                      onClick={() => setSelectedPlan(plan.key)}
                      className={`cursor-pointer w-full bg-white rounded-3xl p-6 md:p-8 flex flex-col h-full relative transition-all duration-200 ${isSelected
                          ? 'border-2 border-violet-600 shadow-xl shadow-violet-600/10'
                          : 'border border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      {plan.isPopular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                          Mais popular
                        </span>
                      )}

                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-6">{plan.tagline}</p>

                      <div className="mb-6">
                        <span className="text-4xl font-bold text-gray-900">
                          R$ {plan.price}
                        </span>
                        <span className="text-gray-500 text-sm">/mês</span>
                      </div>

                      <ul className="space-y-3 text-sm text-gray-700 mb-8 flex-1">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Link
                        to={`/cadastro?plan=${plan.key}`}
                        className={`block text-center py-3 rounded-full font-semibold transition ${isSelected
                            ? 'bg-violet-600 text-white hover:bg-violet-700'
                            : 'border border-violet-600 text-violet-600 hover:bg-violet-50'
                          }`}
                      >
                        {plan.ctaLabel}
                      </Link>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          )}

          <Reveal delay={400}>
            <p className="text-center text-xs text-gray-500 mt-8">
              Todos os planos incluem 7 dias grátis. Cancele quando quiser.
            </p>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 py-16 md:py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <Reveal>
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                Perguntas frequentes
              </h2>
              <p className="text-gray-600 text-base md:text-lg">
                Ficou com alguma dúvida? Separamos as mais comuns.
              </p>
            </div>
          </Reveal>

          <div className="space-y-3">
            {[
              {
                q: 'Preciso instalar algum aplicativo?',
                a: 'Não. O AgendaApp funciona direto no navegador, tanto para você quanto para seus clientes. Basta acessar pelo celular ou computador.',
              },
              {
                q: 'Meus clientes precisam criar conta para agendar?',
                a: 'Não. Seus clientes apenas informam nome e contato no momento do agendamento. Sem senhas, sem cadastro, sem complicação.',
              },
              {
                q: 'Posso ter mais de um profissional na mesma agenda?',
                a: 'Sim. Cada profissional tem seus próprios horários, serviços e agendamentos, e todos são gerenciados no mesmo painel.',
              },
              {
                q: 'Consigo personalizar os serviços e preços?',
                a: 'Sim. Você cadastra quantos serviços quiser, define duração, preço e quais profissionais realizam cada um.',
              },
              {
                q: 'Posso cancelar quando quiser?',
                a: 'Sim. Não há contrato de fidelidade. Você pode cancelar a assinatura a qualquer momento pelo próprio painel.',
              },
              {
                q: 'Existe algum período de teste?',
                a: 'Sim, todos os planos incluem 7 dias grátis. Você pode testar sem compromisso antes de assinar.',
              },
            ].map((item, index) => (
              <Reveal key={index} delay={(index + 1) * 100}>
                <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between text-left px-5 py-4 hover:bg-gray-50 gap-3 transition"
                  >
                    <span className="font-medium text-gray-900 text-sm md:text-base">
                      {item.q}
                    </span>
                    <span className="text-violet-600 text-xl leading-none flex-shrink-0">
                      {openFaq === index ? '−' : '+'}
                    </span>
                  </button>
                  {openFaq === index && (
                    <div className="px-5 py-4 bg-gray-50 text-sm text-gray-600 border-t border-gray-200 leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 md:py-24 bg-violet-600 relative overflow-hidden">
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-violet-500/40 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-violet-500/30 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <Reveal>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-5 tracking-tight">
              Pronto para organizar sua agenda?
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-violet-100 text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Crie sua conta em menos de um minuto e comece a receber agendamentos hoje mesmo.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <Link
              to="/cadastro"
              className="inline-block bg-white text-violet-600 px-8 py-3.5 rounded-full font-semibold hover:bg-violet-50 transition shadow-xl shadow-violet-900/20"
            >
              Criar minha agenda grátis
            </Link>
          </Reveal>
          <Reveal delay={300}>
            <p className="text-violet-200 text-xs mt-5">
              7 dias grátis. Sem cartão de crédito.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <h3 className="text-white text-lg md:text-xl font-bold mb-3">AgendaApp</h3>
              <p className="text-sm max-w-md leading-relaxed">
                A agenda online feita para salões, barbearias, estúdios e profissionais da beleza.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">
                Produto
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button onClick={() => scrollToSection('como-funciona')} className="hover:text-white transition">
                    Como funciona
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('planos')} className="hover:text-white transition">
                    Planos
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('faq')} className="hover:text-white transition">
                    Dúvidas
                  </button>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition">
                    Entrar
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">
                Legal
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/termos" className="hover:text-white transition">
                    Termos de uso
                  </Link>
                </li>
                <li>
                  <Link to="/privacidade" className="hover:text-white transition">
                    Política de privacidade
                  </Link>
                </li>
                <li>
                  <a href="mailto:[E-MAIL DE CONTATO]" className="hover:text-white transition">
                    Contato
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-center md:text-left">
              © {new Date().getFullYear()} AgendaApp. Todos os direitos reservados.
            </p>
            <p className="text-xs text-center md:text-right">
              Feito com carinho para profissionais da beleza
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Mockup de celular
function PhoneMockup({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative w-full max-w-[240px] sm:max-w-[260px] md:max-w-[280px]">
      <div className="relative rounded-[2.5rem] bg-gray-900 p-3 shadow-2xl">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-4 md:w-24 md:h-5 bg-gray-900 rounded-b-2xl z-10" />

        <div className="relative rounded-[2rem] overflow-hidden bg-white aspect-[9/19.5]">
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-50 to-gray-100 text-gray-400 text-xs text-center px-6">
            <div>
              <svg
                className="w-10 h-10 mx-auto mb-3 text-gray-300"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="M21 15l-3.086-3.086a2 2 0 00-2.828 0L6 21" />
              </svg>
              <p className="font-medium text-gray-500">Sua imagem aqui</p>
              <p className="text-[10px] mt-1 break-all">{src}</p>
            </div>
          </div>

          <img
            src={src}
            alt={alt}
            className="relative w-full h-full object-cover z-[1]"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      </div>

      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-gray-900/20 rounded-full blur-xl" />
    </div>
  );
}