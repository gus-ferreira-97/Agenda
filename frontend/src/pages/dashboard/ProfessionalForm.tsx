import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, User, Briefcase, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export default function ProfessionalForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      api.get(`/professionals/${id}`)
        .then((response) => {
          setName(response.data.name);
          setSpecialty(response.data.specialty);
          setIsActive(response.data.is_active);
        })
        .catch(() => setError('Erro ao carregar profissional'))
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload = { name, specialty, isActive };

    try {
      if (isEditing) {
        await api.patch(`/professionals/${id}`, payload);
      } else {
        await api.post('/professionals', payload);
      }
      navigate('/admin/professionals');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(' ') : msg || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
          <svg className="animate-spin w-6 h-6 mx-auto mb-3 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Carregando...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <Link
          to="/admin/professionals"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para profissionais
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {isEditing ? 'Editar Profissional' : 'Novo Profissional'}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {isEditing
            ? 'Atualize as informações do profissional.'
            : 'Adicione um novo profissional à sua equipe.'}
        </p>
      </div>

      {/* Formulário */}
      <div className="max-w-2xl animate-fade-in-up delay-100">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nome do profissional
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Ex.: Maria Silva"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-2">
              Especialidade
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                id="specialty"
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Ex.: Cabeleireira, Nail Designer"
                required
              />
            </div>
          </div>

          {/* Toggle de status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className={`w-5 h-5 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
              <div>
                <p className="text-sm font-medium text-gray-900">Profissional ativo</p>
                <p className="text-xs text-gray-500">
                  {isActive
                    ? 'Aparece na página de agendamento'
                    : 'Não aparece na página de agendamento'}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-checked:bg-blue-600 rounded-full transition"></div>
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition peer-checked:translate-x-5"></div>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/admin/professionals"
              className="flex-1 text-center border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition inline-flex items-center justify-center gap-2"
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
                  Salvar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}