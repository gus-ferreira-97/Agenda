import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X } from 'lucide-react';
import { getConsent, saveConsent } from '../utils/cookieConsent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const consent = getConsent();
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    saveConsent({ essential: true, analytics: true, marketing: true });
    setVisible(false);
  };

  const handleRejectNonEssential = () => {
    saveConsent({ essential: true, analytics: false, marketing: false });
    setVisible(false);
  };

  const handleSavePreferences = () => {
    saveConsent({ essential: true, analytics, marketing });
    setVisible(false);
    setShowConfig(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-5">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Ícone + texto */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Cookie className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm md:text-base mb-1">
                  Nós usamos cookies
                </p>
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                  Utilizamos cookies essenciais para o funcionamento da plataforma e, com seu
                  consentimento, cookies analíticos e de marketing. Saiba mais na nossa{' '}
                  <Link to="/privacidade" className="text-blue-600 hover:underline font-medium">
                    Política de Privacidade
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto md:flex-shrink-0">
              <button
                onClick={() => setShowConfig(true)}
                className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition whitespace-nowrap"
              >
                Personalizar
              </button>
              <button
                onClick={handleRejectNonEssential}
                className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition whitespace-nowrap"
              >
                Apenas essenciais
              </button>
              <button
                onClick={handleAcceptAll}
                className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
              >
                Aceitar todos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de configuração */}
      {showConfig && (
        <div
          className="fixed inset-0 z-[110] bg-black/50 flex items-end sm:items-center justify-center sm:p-4"
          onClick={() => setShowConfig(false)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do modal */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 md:px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-base md:text-lg font-bold text-gray-900">
                Preferências de cookies
              </h2>
              <button
                onClick={() => setShowConfig(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition flex-shrink-0"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 md:px-6 py-4 md:py-5">
              <p className="text-xs md:text-sm text-gray-600 mb-5">
                Escolha quais categorias de cookies você permite. Os essenciais não podem
                ser desativados porque são necessários para o funcionamento da plataforma.
              </p>

              {/* Essenciais */}
              <div className="border border-gray-200 rounded-lg p-4 mb-3">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <h3 className="font-semibold text-gray-900 text-sm">Essenciais</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded whitespace-nowrap">
                    Sempre ativos
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Necessários para autenticação, segurança e funcionamento básico da plataforma.
                </p>
              </div>

              {/* Analíticos */}
              <div className="border border-gray-200 rounded-lg p-4 mb-3">
                <div className="flex items-center justify-between mb-1 gap-3">
                  <h3 className="font-semibold text-gray-900 text-sm">Analíticos</h3>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={analytics}
                      onChange={(e) => setAnalytics(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-gray-300 peer-checked:bg-blue-600 rounded-full transition"></div>
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
                  </label>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Nos ajudam a entender como a plataforma é usada, permitindo melhorias contínuas.
                </p>
              </div>

              {/* Marketing */}
              <div className="border border-gray-200 rounded-lg p-4 mb-5">
                <div className="flex items-center justify-between mb-1 gap-3">
                  <h3 className="font-semibold text-gray-900 text-sm">Marketing</h3>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={marketing}
                      onChange={(e) => setMarketing(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-gray-300 peer-checked:bg-blue-600 rounded-full transition"></div>
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
                  </label>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Usados para exibir anúncios mais relevantes e medir a eficácia de campanhas.
                </p>
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-2 pb-2">
                <button
                  onClick={() => setShowConfig(false)}
                  className="w-full sm:flex-1 px-4 py-3 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="w-full sm:flex-1 px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                >
                  Salvar preferências
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}