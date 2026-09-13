import { useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'basico' | 'profissional' | 'premium'>('profissional');

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
      <header className="sticky top-0 z-50 bg-white shadow-sm animate-fade-in">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-3">
          <Link to="/" className="text-lg md:text-xl font-bold text-blue-600 flex-shrink-0">
            AgendaApp
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <button onClick={() => scrollToSection('como-funciona')} className="hover:text-blue-600">
              Como funciona
            </button>
            <button onClick={() => scrollToSection('planos')} className="hover:text-blue-600">
              Planos
            </button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-blue-600">
              Dúvidas
            </button>
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <Link
              to="/login"
              className="hidden sm:inline text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Entrar
            </Link>
            <Link
              to="/cadastro"
              className="bg-blue-600 text-white text-xs md:text-sm px-3 md:px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap"
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
              <button onClick={() => scrollToSection('como-funciona')} className="text-left py-2.5 hover:text-blue-600">
                Como funciona
              </button>
              <button onClick={() => scrollToSection('planos')} className="text-left py-2.5 hover:text-blue-600">
                Planos
              </button>
              <button onClick={() => scrollToSection('faq')} className="text-left py-2.5 hover:text-blue-600">
                Dúvidas
              </button>
              <Link to="/login" className="py-2.5 hover:text-blue-600">
                Entrar
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-12 md:py-24">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center">
          <div>
            <Reveal>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
                A agenda online do seu salão, barbearia ou estúdio
              </h1>
            </Reveal>
            <Reveal delay={100}>
              <p className="text-gray-600 text-base md:text-lg mb-8">
                Seus clientes agendam sozinhos pelo seu link, sem baixar app e sem criar conta.
                Você gerencia profissionais, serviços e horários em um só lugar.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/cadastro"
                  className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 text-center"
                >
                  Começar grátis
                </Link>
                <button
                  onClick={() => scrollToSection('mockups')}
                  className="w-full sm:w-auto border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 text-center"
                >
                  Ver como funciona
                </button>
              </div>
            </Reveal>
          </div>

          <Reveal delay={300}>
            <div className="flex justify-center">
              <div className="w-full max-w-xs md:max-w-sm h-72 md:h-96 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center text-gray-400 text-sm">
                Mockup do celular aqui
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal>
            <div className="text-center mb-10 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Por que usar o AgendaApp?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
                Tudo o que você precisa para organizar sua agenda e atender melhor seus clientes.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                ),
                title: 'Link próprio para agendar',
                description: 'Compartilhe seu link personalizado e deixe seus clientes agendarem sozinhos, sem baixar nada.',
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-5.13a4 4 0 11-8 0 4 4 0 018 0zm6 0a3 3 0 11-6 0 3 3 0 016 0z" />
                ),
                title: 'Vários profissionais',
                description: 'Cada profissional com seus próprios horários, serviços e agenda — tudo no mesmo lugar.',
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ),
                title: 'Sem cadastro para o cliente',
                description: 'Seu cliente só informa nome e contato. Nada de senhas ou aplicativos.',
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                ),
                title: 'Você no controle',
                description: 'Gerencie serviços, horários e agendamentos em um painel simples e rápido.',
              },
            ].map((item, index) => (
              <Reveal key={index} delay={(index + 1) * 100} className="h-full">
                <div className="bg-gray-50 rounded-xl p-5 md:p-6 border border-gray-100 hover:shadow-md transition h-full">
                  <div className="w-11 h-11 md:w-12 md:h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-3 md:mb-4">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      {item.icon}
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="scroll-mt-20 py-12 md:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal>
            <div className="text-center mb-10 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Como funciona
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
                Em três passos simples você já está com sua agenda online pronta para receber clientes.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-8">
            {[
              { step: '1', title: 'Crie sua conta', description: 'Cadastre-se gratuitamente em menos de um minuto e escolha o subdomínio da sua agenda.' },
              { step: '2', title: 'Configure tudo', description: 'Adicione seus profissionais, serviços, preços e horários de atendimento em poucos cliques.' },
              { step: '3', title: 'Compartilhe seu link', description: 'Divulgue seu link único nas redes sociais e deixe seus clientes agendarem sozinhos.' },
            ].map((item, index) => (
              <Reveal key={index} delay={(index + 1) * 100}>
                <div className="text-center">
                  <div className="w-12 h-12 md:w-14 md:h-14 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center text-lg md:text-xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-base md:text-lg">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={400}>
            <div className="mt-10 md:mt-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-12 text-center">
              <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-3">
                Pronto para ver na prática?
              </h3>
              <p className="text-gray-600 mb-6 max-w-lg mx-auto text-sm md:text-base">
                Veja como seus clientes vão agendar em segundos, direto pelo celular.
              </p>
              <button
                onClick={() => scrollToSection('mockups')}
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Ver o produto em ação
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mockups do produto */}
      <section id="mockups" className="scroll-mt-20 py-12 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal>
            <div className="text-center mb-10 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Veja como é simples
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
                Do agendamento do cliente até o painel do seu negócio — tudo pensado para ser rápido e intuitivo.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
            {/* Mockup 1 — Página pública */}
            <Reveal delay={100}>
              <div className="flex flex-col items-center">
                <PhoneMockup
                  src="/mockups/public-booking.png"
                  alt="Página pública de agendamento"
                />
                <div className="mt-6 text-center">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">
                    Página de agendamento
                  </h3>
                  <p className="text-sm text-gray-600 max-w-xs mx-auto">
                    Seus clientes escolhem profissional, serviço e horário em poucos toques.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Mockup 2 — Painel admin */}
            <Reveal delay={200}>
              <div className="flex flex-col items-center">
                <PhoneMockup
                  src="/mockups/admin-dashboard.png"
                  alt="Painel administrativo"
                />
                <div className="mt-6 text-center">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">
                    Painel de gestão
                  </h3>
                  <p className="text-sm text-gray-600 max-w-xs mx-auto">
                    Acompanhe agendamentos, profissionais e resultados do seu negócio em um só lugar.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Segmentos */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal>
            <div className="text-center mb-10 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Feito para o seu tipo de negócio
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
                Seja qual for a sua área, o AgendaApp se adapta à sua rotina.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {[
              { label: 'Lash Design', emoji: '👁️' },
              { label: 'Nail Design', emoji: '💅' },
              { label: 'Cabeleireiros', emoji: '💇' },
              { label: 'Barbearias', emoji: '💈' },
              { label: 'Estética', emoji: '✨' },
              { label: 'Maquiagem', emoji: '💄' },
            ].map((segment, index) => (
              <Reveal key={segment.label} delay={(index + 1) * 100}>
                <div className="bg-white border border-gray-100 rounded-xl p-3 md:p-4 flex flex-col items-center justify-center text-center hover:shadow-sm transition">
                  <span className="text-2xl md:text-3xl mb-1 md:mb-2">{segment.emoji}</span>
                  <span className="text-xs md:text-sm font-medium text-gray-800">{segment.label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="scroll-mt-20 py-12 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal>
            <div className="text-center mb-10 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Planos que cabem no seu negócio
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
                Comece grátis e evolua conforme sua agenda crescer. Sem contrato de fidelidade.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 max-w-5xl mx-auto">
            {/* Card Básico */}
            <Reveal delay={100} className="h-full">
              <div
                onClick={() => setSelectedPlan('basico')}
                className={`cursor-pointer w-full bg-white rounded-2xl p-5 md:p-6 flex flex-col h-full transition-all duration-200 ${selectedPlan === 'basico'
                    ? 'border-2 border-blue-600 shadow-md'
                    : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Básico</h3>
                <p className="text-sm text-gray-500 mb-6">Para quem está começando</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-gray-900">R$ 49</span>
                  <span className="text-gray-500 text-sm">/mês</span>
                </div>
                <ul className="space-y-3 text-sm text-gray-700 mb-8 flex-1">
                  <li className="flex items-start gap-2"><span className="text-blue-600">✓</span> 1 profissional</li>
                  <li className="flex items-start gap-2"><span className="text-blue-600">✓</span> Serviços ilimitados</li>
                  <li className="flex items-start gap-2"><span className="text-blue-600">✓</span> Link público de agendamento</li>
                  <li className="flex items-start gap-2"><span className="text-blue-600">✓</span> Painel de agendamentos</li>
                </ul>
                <Link
                  to="/cadastro?plan=basico"
                  className={`block text-center py-2.5 rounded-lg font-semibold transition ${selectedPlan === 'basico'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'border border-blue-600 text-blue-600 hover:bg-blue-50'
                    }`}
                >
                  Começar grátis
                </Link>
              </div>
            </Reveal>

            {/* Card Profissional */}
            <Reveal delay={200} className="h-full">
              <div
                onClick={() => setSelectedPlan('profissional')}
                className={`cursor-pointer w-full bg-white rounded-2xl p-5 md:p-6 flex flex-col h-full relative transition-all duration-200 ${selectedPlan === 'profissional'
                    ? 'border-2 border-blue-600 shadow-md'
                    : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
              >
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                  Mais popular
                </span>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Profissional</h3>
                <p className="text-sm text-gray-500 mb-6">Para salões em crescimento</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-gray-900">R$ 89</span>
                  <span className="text-gray-500 text-sm">/mês</span>
                </div>
                <ul className="space-y-3 text-sm text-gray-700 mb-8 flex-1">
                  <li className="flex items-start gap-2"><span className="text-blue-600">✓</span> Até 5 profissionais</li>
                  <li className="flex items-start gap-2"><span className="text-blue-600">✓</span> Serviços ilimitados</li>
                  <li className="flex items-start gap-2"><span className="text-blue-600">✓</span> Link público de agendamento</li>
                  <li className="flex items-start gap-2"><span className="text-blue-600">✓</span> Painel completo de gestão</li>
                  <li className="flex items-start gap-2"><span className="text-blue-600">✓</span> Suporte por e-mail</li>
                </ul>
                <Link
                  to="/cadastro?plan=profissional"
                  className={`block text-center py-2.5 rounded-lg font-semibold transition ${selectedPlan === 'profissional'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'border border-blue-600 text-blue-600 hover:bg-blue-50'
                    }`}
                >
                  Assinar agora
                </Link>
              </div>
            </Reveal>

            {/* Card Premium */}
            <Reveal delay={300} className="h-full">
              <div
                onClick={() => setSelectedPlan('premium')}
                className={`cursor-pointer w-full bg-white rounded-2xl p-5 md:p-6 flex flex-col h-full transition-all duration-200 ${selectedPlan === 'premium'
                    ? 'border-2 border-blue-600 shadow-md'
                    : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Premium</h3>
                <p className="text-sm text-gray-500 mb-6">Para estúdios e equipes grandes</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-gray-900">R$ 149</span>
                  <span className="text-gray-500 text-sm">/mês</span>
                </div>
                <ul className="space-y-3 text-sm text-gray-700 mb-8 flex-1">
                  <li className="flex items-start gap-2"><span className="text-blue-600">✓</span> Profissionais ilimitados</li>
                  <li className="flex items-start gap-2"><span className="text-blue-600">✓</span> Serviços ilimitados</li>
                  <li className="flex items-start gap-2"><span className="text-blue-600">✓</span> Link público de agendamento</li>
                  <li className="flex items-start gap-2"><span className="text-blue-600">✓</span> Painel completo de gestão</li>
                  <li className="flex items-start gap-2"><span className="text-blue-600">✓</span> Suporte prioritário</li>
                  <li className="flex items-start gap-2"><span className="text-blue-600">✓</span> Relatórios avançados</li>
                </ul>
                <Link
                  to="/cadastro?plan=premium"
                  className={`block text-center py-2.5 rounded-lg font-semibold transition ${selectedPlan === 'premium'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'border border-blue-600 text-blue-600 hover:bg-blue-50'
                    }`}
                >
                  Assinar agora
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal delay={400}>
            <p className="text-center text-xs text-gray-500 mt-6 md:mt-8">
              Todos os planos incluem 7 dias grátis. Cancele quando quiser.
            </p>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 py-12 md:py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <Reveal>
            <div className="text-center mb-10 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Perguntas frequentes
              </h2>
              <p className="text-gray-600 text-sm md:text-base">
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
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between text-left px-4 md:px-5 py-3.5 md:py-4 hover:bg-gray-50 gap-3"
                  >
                    <span className="font-medium text-gray-900 text-sm md:text-base">{item.q}</span>
                    <span className="text-blue-600 text-xl leading-none flex-shrink-0">
                      {openFaq === index ? '−' : '+'}
                    </span>
                  </button>
                  {openFaq === index && (
                    <div className="px-4 md:px-5 py-3.5 md:py-4 bg-gray-50 text-sm text-gray-600 border-t border-gray-200">
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
      <section className="py-12 md:py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Reveal>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
              Pronto para organizar sua agenda?
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-blue-100 text-sm md:text-lg mb-8 max-w-2xl mx-auto">
              Crie sua conta em menos de um minuto e comece a receber agendamentos hoje mesmo.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <Link
              to="/cadastro"
              className="inline-block bg-white text-blue-600 px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-blue-50"
            >
              Criar minha agenda grátis
            </Link>
          </Reveal>
          <Reveal delay={300}>
            <p className="text-blue-100 text-xs mt-4">
              7 dias grátis. Sem cartão de crédito.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 md:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-8 mb-8">
            <div className="md:col-span-2">
              <h3 className="text-white text-lg md:text-xl font-bold mb-3">AgendaApp</h3>
              <p className="text-sm max-w-md">
                A agenda online feita para salões, barbearias, estúdios e profissionais da beleza.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 text-sm uppercase">Produto</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => scrollToSection('como-funciona')} className="hover:text-white">Como funciona</button></li>
                <li><button onClick={() => scrollToSection('planos')} className="hover:text-white">Planos</button></li>
                <li><button onClick={() => scrollToSection('faq')} className="hover:text-white">Dúvidas</button></li>
                <li><Link to="/login" className="hover:text-white">Entrar</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 text-sm uppercase">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/termos" className="hover:text-white">Termos de uso</Link></li>
                <li><Link to="/privacidade" className="hover:text-white">Política de privacidade</Link></li>
                <li><a href="mailto:[E-MAIL DE CONTATO]" className="hover:text-white">Contato</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-center md:text-left">
              © {new Date().getFullYear()} AgendaApp. Todos os direitos reservados.
            </p>
            <p className="text-xs text-center md:text-right">
              Feito com carinho para profissionais da beleza 💙
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Componente auxiliar: mockup de celular
function PhoneMockup({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative w-full max-w-[220px] sm:max-w-[260px] md:max-w-[280px]">
      {/* Moldura do celular */}
      <div className="relative rounded-[2.5rem] bg-gray-900 p-3 shadow-2xl">
        {/* Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-4 md:w-24 md:h-5 bg-gray-900 rounded-b-2xl z-10" />

        {/* Tela */}
        <div className="relative rounded-[2rem] overflow-hidden bg-white aspect-[9/19.5]">
          {/* Placeholder caso a imagem não exista */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 text-gray-400 text-xs text-center px-6">
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

          {/* Imagem real (fica por cima do placeholder quando carregada) */}
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

      {/* Sombra/reflexo abaixo do celular */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-gray-900/20 rounded-full blur-xl" />
    </div>
  );
}