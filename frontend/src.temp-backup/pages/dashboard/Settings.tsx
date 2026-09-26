import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Palette,
  Image as ImageIcon,
  MessageSquare,
  Phone,
  MapPin,
  Save,
  Eye,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import api from '../../services/api';
import { usePlan } from '../../hooks/usePlan';

interface BrandingData {
  id: number;
  name: string;
  subdomain: string;
  primaryColor: string;
  logoUrl: string | null;
  welcomeMessage: string | null;
  phone: string | null;
  address: string | null;
}

const PRESET_COLORS = [
  '#2563eb',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#0f172a',
];

export default function Settings() {
  const { plan } = usePlan();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [logoUrl, setLogoUrl] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [logoError, setLogoError] = useState(false);

  const canEdit = plan?.allowBranding ?? false;

  useEffect(() => {
    api.get('/tenants/me/branding')
      .then((response) => {
        const data: BrandingData = response.data;
        setName(data.name);
        setSubdomain(data.subdomain);
        setPrimaryColor(data.primaryColor || '#2563eb');
        setLogoUrl(data.logoUrl || '');
        setWelcomeMessage(data.welcomeMessage || '');
        setPhone(data.phone || '');
        setAddress(data.address || '');
      })
      .catch(() => setError('Erro ao carregar configurações'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLogoError(false);
  }, [logoUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await api.patch('/tenants/me/branding', {
        primaryColor,
        logoUrl: logoUrl || undefined,
        welcomeMessage: welcomeMessage || undefined,
        phone: phone || undefined,
        address: address || undefined,
      });
      setSuccess('Configurações salvas com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(' ') : msg || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
          <svg className="animate-spin w-6 h-6 mx-auto mb-3 text-violet-300" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Carregando...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8 animate-fade-in-up">
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1">Configurações</h1>
        <p className="text-sm md:text-base text-gray-600">
          Personalize a aparência da sua página de agendamento.
        </p>
      </div>

      {/* Aviso de upgrade */}
      {!canEdit && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4 md:mb-6 flex items-start gap-3 animate-fade-in-up delay-100">
          <Lock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-yellow-900">
              Personalização disponível apenas nos planos Profissional e Premium
            </p>
            <p className="text-sm text-yellow-800 mt-0.5">
              Faça upgrade para desbloquear cores personalizadas, logo, mensagem de boas-vindas, telefone e endereço.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Formulário */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8 space-y-6 animate-fade-in-up delay-100"
          >
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Cor principal */}
            <div className={!canEdit ? 'opacity-60 pointer-events-none' : ''}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Palette className="inline w-4 h-4 mr-1 -mt-0.5" />
                Cor principal
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setPrimaryColor(color)}
                    className={`w-9 h-9 rounded-lg border-2 transition ${primaryColor.toLowerCase() === color.toLowerCase()
                      ? 'border-gray-900 scale-110'
                      : 'border-gray-200 hover:border-gray-400'
                      }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border-2 border-gray-200 cursor-pointer flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-24 px-2 py-1.5 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-violet-300"
                    placeholder="#2563eb"
                  />
                </div>
              </div>
            </div>

            {/* Logo URL */}
            <div className={!canEdit ? 'opacity-60 pointer-events-none' : ''}>
              <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                <ImageIcon className="inline w-4 h-4 mr-1 -mt-0.5" />
                URL do logo <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                id="logoUrl"
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
                placeholder="https://exemplo.com/logo.png"
                disabled={!canEdit}
              />
              <p className="text-xs text-gray-500 mt-1">
                Cole o link de uma imagem hospedada online. Em breve teremos upload direto.
              </p>
              {logoUrl && logoError && (
                <div className="mt-2 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg flex items-start gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    Não foi possível carregar a imagem. Verifique se a URL aponta direto para um arquivo (ex.: <code className="text-[10px]">.png</code>, <code className="text-[10px]">.jpg</code>, <code className="text-[10px]">.svg</code>).
                  </span>
                </div>
              )}
            </div>

            {/* Mensagem de boas-vindas */}
            <div className={!canEdit ? 'opacity-60 pointer-events-none' : ''}>
              <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="inline w-4 h-4 mr-1 -mt-0.5" />
                Mensagem de boas-vindas <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                id="welcomeMessage"
                type="text"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
                placeholder="Ex.: Bem-vindo! Agende seu horário em segundos."
                maxLength={200}
                disabled={!canEdit}
              />
            </div>

            {/* Telefone */}
            <div className={!canEdit ? 'opacity-60 pointer-events-none' : ''}>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline w-4 h-4 mr-1 -mt-0.5" />
                Telefone / WhatsApp <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
                placeholder="(11) 99999-9999"
                maxLength={20}
                disabled={!canEdit}
              />
            </div>

            {/* Endereço */}
            <div className={!canEdit ? 'opacity-60 pointer-events-none' : ''}>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1 -mt-0.5" />
                Endereço <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
                placeholder="Rua, número, bairro, cidade"
                maxLength={255}
                disabled={!canEdit}
              />
            </div>

            <div className="flex justify-end pt-2">
              {canEdit ? (
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-violet-300 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-violet-300 disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Salvar alterações
                    </>
                  )}
                </button>
              ) : (
                <Link
                  to="#"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-200 text-gray-500 px-6 py-2.5 rounded-lg font-medium cursor-not-allowed"
                  onClick={(e) => e.preventDefault()}
                >
                  <Lock className="w-4 h-4" />
                  Faça upgrade para editar
                </Link>
              )}
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 animate-fade-in-up delay-200 lg:sticky lg:top-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-700">Pré-visualização</h2>
            </div>

            <div className="rounded-xl border border-gray-200 overflow-hidden">
              {/* Header do preview */}
              <div
                className="p-4 flex items-center gap-3"
                style={{ backgroundColor: primaryColor }}
              >
                {logoUrl && !logoError ? (
                  <img
                    src={logoUrl}
                    alt="Pré-visualização do logo"
                    className="w-10 h-10 rounded-lg object-cover bg-white flex-shrink-0"
                    loading="lazy"
                    decoding="async"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {name?.[0]?.toUpperCase() || 'A'}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{name || 'Seu estabelecimento'}</p>
                  <p className="text-white/80 text-xs truncate">
                    {subdomain ? `${subdomain}.agendy.com.br` : 'seu-subdominio.agendy.com.br'}
                  </p>
                </div>
              </div>

              {/* Conteúdo do preview */}
              <div className="p-4 bg-gray-50">
                <p className="text-xs text-gray-600 mb-3">
                  {welcomeMessage || 'Agende seu horário em segundos.'}
                </p>
                <button
                  type="button"
                  className="w-full py-2 rounded-lg text-white text-sm font-medium"
                  style={{ backgroundColor: primaryColor }}
                >
                  Agendar agora
                </button>
              </div>

              {/* Rodapé do preview */}
              {(phone || address) && (
                <div className="p-3 bg-white border-t border-gray-100 text-xs text-gray-500 space-y-1">
                  {phone && <p>📞 {phone}</p>}
                  {address && <p>📍 {address}</p>}
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Esta é uma prévia aproximada de como sua página pública vai aparecer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}