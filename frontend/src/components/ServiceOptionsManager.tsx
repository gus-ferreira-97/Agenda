import { useEffect, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  DollarSign,
  Clock,
  X,
  Save,
  Package,
  Power,
  PowerOff,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';

interface ServiceOption {
  id: number;
  service_id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number | null;
  duration_minutes: number | null;
  is_active: boolean;
  sort_order: number;
}

interface ServiceOptionsManagerProps {
  serviceId: number;
}

export default function ServiceOptionsManager({ serviceId }: ServiceOptionsManagerProps) {
  const [options, setOptions] = useState<ServiceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageError, setImageError] = useState(false);
  const [price, setPrice] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState('0');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadOptions = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/service-options', {
        params: { serviceId },
      });
      setOptions(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  // Reseta o estado de erro da imagem quando a URL muda
  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  const openCreate = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setImageUrl('');
    setPrice('');
    setDurationMinutes('');
    setIsActive(true);
    setSortOrder('0');
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const openEdit = (option: ServiceOption) => {
    setEditingId(option.id);
    setName(option.name);
    setDescription(option.description || '');
    setImageUrl(option.image_url || '');
    setPrice(option.price !== null ? String(option.price) : '');
    setDurationMinutes(
      option.duration_minutes !== null ? String(option.duration_minutes) : '',
    );
    setIsActive(option.is_active);
    setSortOrder(String(option.sort_order));
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Informe o nome da variação.');
      return;
    }

    const payload: any = {
      serviceId,
      name: name.trim(),
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      isActive,
      sortOrder: parseInt(sortOrder, 10) || 0,
    };

    if (price.trim()) {
      const parsed = parseFloat(price);
      if (isNaN(parsed) || parsed < 0) {
        setError('Preço inválido.');
        return;
      }
      payload.price = parsed;
    }

    if (durationMinutes.trim()) {
      const parsed = parseInt(durationMinutes, 10);
      if (isNaN(parsed) || parsed < 1) {
        setError('Duração inválida.');
        return;
      }
      payload.durationMinutes = parsed;
    }

    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/service-options/${editingId}`, payload);
        setSuccess('Variação atualizada com sucesso!');
      } else {
        await api.post('/service-options', payload);
        setSuccess('Variação criada com sucesso!');
      }
      await loadOptions();
      setTimeout(() => {
        closeForm();
      }, 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(' • ') : msg || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Deseja realmente excluir esta variação?')) return;

    try {
      const response = await api.delete(`/service-options/${id}`);
      const message = response.data?.message;
      if (message && message.includes('desativada')) {
        alert(message);
      }
      await loadOptions();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      alert(Array.isArray(msg) ? msg.join(' ') : msg || 'Erro ao excluir.');
    }
  };

  const handleToggleActive = async (option: ServiceOption) => {
    try {
      await api.patch(`/service-options/${option.id}`, {
        isActive: !option.is_active,
      });
      await loadOptions();
    } catch (err) {
      console.error(err);
      alert('Erro ao alterar status da variação.');
    }
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return null;
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-semibold text-gray-900">Variações do serviço</h2>
          </div>
          <p className="text-xs text-gray-500">
            Adicione opções que o cliente vai escolher ao agendar (ex.: tipos de lash).
            Se não houver variações, o serviço é agendado direto.
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition whitespace-nowrap flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nova
          </button>
        )}
      </div>

      {/* Aviso de sucesso global */}
      {success && !showForm && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Formulário inline */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-5 bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-5 space-y-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900">
              {editingId ? 'Editar variação' : 'Nova variação'}
            </h3>
            <button
              type="button"
              onClick={closeForm}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2 rounded-lg flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Nome da variação *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="Ex.: Volume Russo"
                maxLength={100}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Ordem de exibição
              </label>
              <input
                type="number"
                min={0}
                max={9999}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Descrição <span className="text-gray-400">(opcional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
              rows={2}
              placeholder="Detalhes sobre essa variação..."
              maxLength={1000}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Preço <span className="text-gray-400">(opcional)</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  max={999999}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="Se vazio, usa o do serviço"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Duração (min) <span className="text-gray-400">(opcional)</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="number"
                  min={1}
                  max={1440}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="Se vazio, usa a do serviço"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              URL da imagem <span className="text-gray-400">(opcional)</span>
            </label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="https://exemplo.com/imagem.png"
                maxLength={500}
              />
            </div>
            {imageUrl && !imageError && (
              <div className="mt-2 flex items-center gap-2">
                <img
                  src={imageUrl}
                  alt="Pré-visualização"
                  className="w-14 h-14 rounded-lg object-cover border border-gray-200 bg-white"
                  loading="lazy"
                  decoding="async"
                  onError={() => setImageError(true)}
                />
                <span className="text-xs text-gray-500">Pré-visualização</span>
              </div>
            )}
            {imageUrl && imageError && (
              <div className="mt-2 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>
                  Não foi possível carregar a imagem. Verifique se a URL aponta direto para um
                  arquivo (<code className="text-[10px]">.png</code>, <code className="text-[10px]">.jpg</code>,{' '}
                  <code className="text-[10px]">.svg</code>).
                </span>
              </div>
            )}
          </div>

          {/* Toggle de status */}
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">Variação ativa</p>
                <p className="text-xs text-gray-500">
                  {isActive ? 'Disponível para o cliente escolher' : 'Não aparece para o cliente'}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-checked:bg-purple-600 rounded-full transition"></div>
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition peer-checked:translate-x-5"></div>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              type="button"
              onClick={closeForm}
              className="flex-1 text-center border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition inline-flex items-center justify-center gap-2"
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
                  {editingId ? 'Salvar alterações' : 'Criar variação'}
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Lista de variações */}
      {loading ? (
        <div className="text-center text-sm text-gray-500 py-6">
          Carregando variações...
        </div>
      ) : options.length === 0 ? (
        !showForm && (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Package className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Nenhuma variação cadastrada</p>
            <p className="text-xs text-gray-500">
              Este serviço será agendado diretamente, sem opções para o cliente escolher.
            </p>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map((option) => (
            <div
              key={option.id}
              className={`border rounded-xl overflow-hidden transition ${option.is_active
                ? 'border-gray-200 bg-white'
                : 'border-gray-200 bg-gray-50 opacity-70'
                }`}
            >
              {/* Imagem */}
              <div className="aspect-video bg-gradient-to-br from-purple-50 to-gray-100 flex items-center justify-center overflow-hidden">
                {option.image_url ? (
                  <img
                    src={option.image_url}
                    alt={option.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-gray-300">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold text-gray-900 truncate flex-1">
                    {option.name}
                  </p>
                  <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full whitespace-nowrap ${option.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-200 text-gray-700'
                    }`}>
                    {option.is_active ? 'Ativa' : 'Inativa'}
                  </span>
                </div>

                {option.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                    {option.description}
                  </p>
                )}

                <div className="flex items-center gap-3 text-xs text-gray-700 mb-3">
                  {option.price !== null && (
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(option.price)}
                    </span>
                  )}
                  {option.duration_minutes !== null && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {option.duration_minutes} min
                    </span>
                  )}
                  {(option.price === null && option.duration_minutes === null) && (
                    <span className="text-gray-400">Usa dados do serviço</span>
                  )}
                </div>

                {/* Ações */}
                <div className="flex items-center gap-1 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(option)}
                    title={option.is_active ? 'Desativar' : 'Ativar'}
                    className={`p-1.5 rounded-lg transition ${option.is_active
                      ? 'text-yellow-600 hover:bg-yellow-50'
                      : 'text-green-600 hover:bg-green-50'
                      }`}
                  >
                    {option.is_active ? (
                      <PowerOff className="w-3.5 h-3.5" />
                    ) : (
                      <Power className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(option)}
                    title="Editar"
                    className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(option.id)}
                    title="Excluir"
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}