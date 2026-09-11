import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getConsent, saveConsent } from '../utils/cookieConsent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [analytics, setAnalytics] = useState(true);
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
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1 text-sm text-gray-700">
            <p className="mb-1 font-semibold text-gray-900">🍪 Nós usamos cookies</p>
            <p>
              Utilizamos cookies essenciais para o funcionamento da plataforma e, com seu
              consentimento, cookies analíticos e de marketing. Saiba mais na nossa{' '}
              <Link to="/privacidade" className="text-blue-600 hover:underline">
                Política de Privacidade
              </Link>.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowConfig(true)}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Personalizar
            </button>
            <button
              onClick={handleRejectNonEssential}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Apenas essenciais
            </button>
            <button
              onClick={handleAcceptAll}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Aceitar todos
            </button>
          </div>
        </div>
      </div>

      {/* Modal de configuração */}
      {showConfig && (
        <div className="fixed inset-0 z-[110] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Preferências de cookies
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Escolha quais categorias de cookies você permite. Os essenciais não podem
                ser desativados porque são necessários para o funcionamento da plataforma.
              </p>

              {/* Essenciais */}
              <div className="border border-gray-200 rounded-lg p-4 mb-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 text-sm">Essenciais</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Sempre ativos
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Necessários para autenticação, segurança e funcionamento básico da plataforma.
                </p>
              </div>

              {/* Analíticos */}
              <div className="border border-gray-200 rounded-lg p-4 mb-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 text-sm">Analíticos</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
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
                <p className="text-xs text-gray-600">
                  Nos ajudam a entender como a plataforma é usada, permitindo melhorias contínuas.
                </p>
              </div>

              {/* Marketing */}
              <div className="border border-gray-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 text-sm">Marketing</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
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
                <p className="text-xs text-gray-600">
                  Usados para exibir anúncios mais relevantes e medir a eficácia de campanhas.
                </p>
              </div>

              {/* Botões do modal */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setShowConfig(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
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