import { useEffect, useState, useMemo } from 'react';
import {
  MapPin,
  Phone,
  Clock,
  User,
  Briefcase,
  CheckCircle2,
  Calendar,
  ChevronLeft,
  Package,
} from 'lucide-react';
import api from '../services/api';

interface TenantInfo {
  id: number;
  name: string;
  subdomain: string;
  primaryColor: string;
  logoUrl: string | null;
  welcomeMessage: string | null;
  phone: string | null;
  address: string | null;
}

interface Professional {
  id: number;
  name: string;
  specialty: string;
}

interface Service {
  id: number;
  name: string;
  duration_minutes: number;
  price?: number;
}

interface ServiceOption {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number | null;
  durationMinutes: number | null;
}

interface ProfessionalService {
  professional_id: number;
  service_id: number;
}

export default function PublicBooking() {
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [associations, setAssociations] = useState<ProfessionalService[]>([]);

  const [selectedProfessional, setSelectedProfessional] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');

  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ============ CARREGAMENTO INICIAL ============

  useEffect(() => {
    async function loadData() {
      try {
        const [tenantResp, profResp, servResp] = await Promise.all([
          api.get('/public/tenant-info'),
          api.get('/public/professionals'),
          api.get('/public/services'),
        ]);
        setTenant(tenantResp.data);
        setProfessionals(profResp.data);
        setServices(servResp.data);

        try {
          const assocResp = await api.get('/public/professional-services');
          setAssociations(assocResp.data);
        } catch {
          setAssociations([]);
        }
      } catch (err) {
        setError('Erro ao carregar dados. Tente novamente mais tarde.');
      } finally {
        setLoadingInitial(false);
      }
    }
    loadData();
  }, []);

  // ============ SERVIÇOS DISPONÍVEIS POR PROFISSIONAL ============

  const availableServices = useMemo(() => {
    if (!selectedProfessional) return [];
    if (associations.length === 0) return services;
    const serviceIds = associations
      .filter((a) => a.professional_id === selectedProfessional)
      .map((a) => a.service_id);
    return services.filter((s) => serviceIds.includes(s.id));
  }, [selectedProfessional, services, associations]);

  // ============ CARREGAR VARIAÇÕES DO SERVIÇO ============

  useEffect(() => {
    if (!selectedService) {
      setServiceOptions([]);
      setSelectedOption(null);
      return;
    }

    setLoadingOptions(true);
    setSelectedOption(null);

    api
      .get(`/public/services/${selectedService}/options`)
      .then((resp) => {
        setServiceOptions(resp.data);
      })
      .catch(() => {
        setServiceOptions([]);
      })
      .finally(() => setLoadingOptions(false));
  }, [selectedService]);

  const hasOptions = serviceOptions.length > 0;
  const canChooseDate = selectedService && (!hasOptions || selectedOption);

  // Números das etapas mudam se tiver etapa de variação
  const stepOffset = hasOptions ? 1 : 0;

  // ============ CARREGAR SLOTS ============

  useEffect(() => {
    if (canChooseDate && selectedDate) {
      setLoadingSlots(true);
      setError('');
      api
        .get('/public/available-slots', {
          params: {
            professionalId: selectedProfessional,
            serviceId: selectedService,
            date: selectedDate,
            ...(selectedOption ? { serviceOptionId: selectedOption } : {}),
          },
        })
        .then((response) => {
          setAvailableSlots(response.data);
          setSelectedSlot('');
        })
        .catch(() => {
          setError('Erro ao buscar horários disponíveis.');
          setAvailableSlots([]);
        })
        .finally(() => setLoadingSlots(false));
    } else {
      setAvailableSlots([]);
    }
  }, [selectedProfessional, selectedService, selectedOption, selectedDate, canChooseDate]);

  // ============ SUBMIT ============

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!selectedProfessional || !selectedService || !selectedDate || !selectedSlot) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    if (hasOptions && !selectedOption) {
      setError('Selecione uma variação do serviço.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/public/appointments', {
        professionalId: selectedProfessional,
        serviceId: selectedService,
        ...(selectedOption ? { serviceOptionId: selectedOption } : {}),
        customerName,
        customerContact,
        startTime: `${selectedDate}T${selectedSlot}:00`,
      });
      setMessage('Agendamento realizado com sucesso!');
      setCustomerName('');
      setCustomerContact('');
      setSelectedSlot('');
      if (canChooseDate && selectedDate) {
        const resp = await api.get('/public/available-slots', {
          params: {
            professionalId: selectedProfessional,
            serviceId: selectedService,
            date: selectedDate,
            ...(selectedOption ? { serviceOptionId: selectedOption } : {}),
          },
        });
        setAvailableSlots(resp.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao realizar agendamento.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetAll = () => {
    setSelectedProfessional(null);
    setSelectedService(null);
    setServiceOptions([]);
    setSelectedOption(null);
    setSelectedDate('');
    setSelectedSlot('');
    setAvailableSlots([]);
    setMessage('');
    setError('');
  };

  const primary = tenant?.primaryColor || '#2563eb';

  const formatCurrency = (value?: number | null) => {
    if (value === undefined || value === null) return null;
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDateLabel = (iso: string) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    });
  };

  const groupedSlots = useMemo(() => {
    const morning: string[] = [];
    const afternoon: string[] = [];
    const evening: string[] = [];
    availableSlots.forEach((slot) => {
      const hour = parseInt(slot.split(':')[0], 10);
      if (hour < 12) morning.push(slot);
      else if (hour < 18) afternoon.push(slot);
      else evening.push(slot);
    });
    return { morning, afternoon, evening };
  }, [availableSlots]);

  const selectedProfessionalData = professionals.find((p) => p.id === selectedProfessional);
  const selectedServiceData = services.find((s) => s.id === selectedService);
  const selectedOptionData = serviceOptions.find((o) => o.id === selectedOption);

  // ============ RENDER ============

  if (loadingInitial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md text-center">
          <h1 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Estabelecimento não encontrado</h1>
          <p className="text-gray-600 text-sm">
            Verifique o endereço ou entre em contato com o estabelecimento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="shadow-sm" style={{ backgroundColor: primary }}>
        <div className="max-w-2xl mx-auto px-4 py-5 md:py-6">
          <div className="flex items-center gap-3 md:gap-4">
            {tenant.logoUrl ? (
              <img
                src={tenant.logoUrl}
                alt={tenant.name}
                className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover bg-white flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white/20 flex items-center justify-center text-white text-lg md:text-xl font-bold flex-shrink-0">
                {tenant.name[0]?.toUpperCase() || 'A'}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-white text-lg md:text-xl font-bold truncate">{tenant.name}</h1>
              <p className="text-white/85 text-xs md:text-sm line-clamp-2">
                {tenant.welcomeMessage || 'Agende seu horário online'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-2xl mx-auto px-3 md:px-4 py-5 md:py-6 pb-20">
        {/* Sucesso */}
        {message && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-4 text-center animate-fade-in-up">
            <div
              className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: `${primary}20` }}
            >
              <CheckCircle2 className="w-7 h-7 md:w-8 md:h-8" style={{ color: primary }} />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-1">Tudo certo!</h2>
            <p className="text-sm text-gray-600 mb-5">{message}</p>
            <button
              onClick={resetAll}
              className="text-sm font-medium px-5 py-2.5 rounded-lg text-white"
              style={{ backgroundColor: primary }}
            >
              Fazer outro agendamento
            </button>
          </div>
        )}

        {/* Erro geral */}
        {error && !message && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {!message && (
          <div className="space-y-3 md:space-y-4">
            {/* Etapa 1: Profissional */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: primary }}
                >
                  1
                </div>
                <h2 className="text-sm font-semibold text-gray-900">Escolha o profissional</h2>
              </div>

              {professionals.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhum profissional disponível.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                  {professionals.map((p) => {
                    const isSelected = selectedProfessional === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedProfessional(p.id);
                          setSelectedService(null);
                          setSelectedOption(null);
                          setSelectedSlot('');
                        }}
                        className={`p-3 rounded-xl border-2 text-left transition ${isSelected ? 'shadow-md' : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        style={isSelected ? { backgroundColor: `${primary}15`, borderColor: primary } : {}}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                            style={{ backgroundColor: primary }}
                          >
                            {p.name[0]?.toUpperCase()}
                          </div>
                          <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{p.specialty}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Etapa 2: Serviço */}
            {selectedProfessional && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 animate-fade-in-up">
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: primary }}
                  >
                    2
                  </div>
                  <h2 className="text-sm font-semibold text-gray-900">Escolha o serviço</h2>
                </div>

                {availableServices.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Este profissional ainda não tem serviços cadastrados.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {availableServices.map((s) => {
                      const isSelected = selectedService === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setSelectedService(s.id);
                            setSelectedSlot('');
                          }}
                          className={`w-full p-3 rounded-xl border-2 text-left transition flex items-center justify-between gap-3 ${isSelected ? 'shadow-md' : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          style={isSelected ? { backgroundColor: `${primary}15`, borderColor: primary } : {}}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${primary}20`, color: primary }}
                            >
                              <Briefcase className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                              <p className="text-xs text-gray-500">{s.duration_minutes} min</p>
                            </div>
                          </div>
                          {s.price !== undefined && s.price !== null && (
                            <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                              {formatCurrency(s.price)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* Etapa 3: Variação (só se o serviço tiver variações) */}
            {selectedProfessional && selectedService && loadingOptions && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 animate-fade-in-up">
                <div className="py-2 text-center text-sm text-gray-500">
                  <svg className="animate-spin w-5 h-5 mx-auto mb-2" style={{ color: primary }} fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Carregando opções...
                </div>
              </section>
            )}

            {selectedProfessional && selectedService && !loadingOptions && hasOptions && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 animate-fade-in-up">
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: primary }}
                  >
                    3
                  </div>
                  <h2 className="text-sm font-semibold text-gray-900">Escolha a variação</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                  {serviceOptions.map((option) => {
                    const isSelected = selectedOption === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setSelectedOption(option.id);
                          setSelectedSlot('');
                        }}
                        className={`rounded-xl border-2 overflow-hidden text-left transition ${isSelected ? 'shadow-md' : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        style={isSelected ? { backgroundColor: `${primary}10`, borderColor: primary } : {}}
                      >
                        {/* Imagem */}
                        {option.imageUrl && (
                          <div className="aspect-video bg-gray-100 overflow-hidden">
                            <img
                              src={option.imageUrl}
                              alt={option.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}

                        <div className="p-3">
                          <div className="flex items-start gap-2 mb-1">
                            <Package className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: primary }} />
                            <p className="text-sm font-medium text-gray-900">{option.name}</p>
                          </div>

                          {option.description && (
                            <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                              {option.description}
                            </p>
                          )}

                          <div className="flex items-center gap-3 text-xs text-gray-700 flex-wrap">
                            {option.price !== null && (
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(option.price)}
                              </span>
                            )}
                            {option.durationMinutes !== null && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-gray-400" />
                                {option.durationMinutes} min
                              </span>
                            )}
                            {option.price === null && option.durationMinutes === null && (
                              <span className="text-gray-400">
                                Preço e duração do serviço
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Etapa Date: Data (aparece se já pode escolher) */}
            {selectedProfessional && selectedService && !loadingOptions && canChooseDate && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 animate-fade-in-up">
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: primary }}
                  >
                    {3 + stepOffset}
                  </div>
                  <h2 className="text-sm font-semibold text-gray-900">Escolha a data</h2>
                </div>

                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedSlot('');
                    }}
                    className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition text-sm"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </section>
            )}

            {/* Etapa Time: Horário */}
            {selectedProfessional && selectedService && !loadingOptions && canChooseDate && selectedDate && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 animate-fade-in-up">
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: primary }}
                  >
                    {4 + stepOffset}
                  </div>
                  <h2 className="text-sm font-semibold text-gray-900">Escolha o horário</h2>
                </div>

                {loadingSlots ? (
                  <div className="py-6 md:py-8 text-center text-sm text-gray-500">
                    <svg className="animate-spin w-5 h-5 mx-auto mb-2" style={{ color: primary }} fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Buscando horários disponíveis...
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhum horário disponível para esta data. Tente outra data.
                  </p>
                ) : (
                  <div className="space-y-3 md:space-y-4">
                    {groupedSlots.morning.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Manhã</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {groupedSlots.morning.map((slot) => (
                            <SlotButton
                              key={slot}
                              slot={slot}
                              isSelected={selectedSlot === slot}
                              primary={primary}
                              onClick={() => setSelectedSlot(slot)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {groupedSlots.afternoon.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Tarde</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {groupedSlots.afternoon.map((slot) => (
                            <SlotButton
                              key={slot}
                              slot={slot}
                              isSelected={selectedSlot === slot}
                              primary={primary}
                              onClick={() => setSelectedSlot(slot)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {groupedSlots.evening.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Noite</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {groupedSlots.evening.map((slot) => (
                            <SlotButton
                              key={slot}
                              slot={slot}
                              isSelected={selectedSlot === slot}
                              primary={primary}
                              onClick={() => setSelectedSlot(slot)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* Etapa Data: dados do cliente + resumo */}
            {selectedProfessional &&
              selectedService &&
              !loadingOptions &&
              canChooseDate &&
              selectedDate &&
              selectedSlot && (
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 animate-fade-in-up">
                  <div className="flex items-center gap-2 mb-3 md:mb-4">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: primary }}
                    >
                      {5 + stepOffset}
                    </div>
                    <h2 className="text-sm font-semibold text-gray-900">Seus dados</h2>
                  </div>

                  {/* Resumo */}
                  <div
                    className="rounded-xl p-3 md:p-4 mb-4 border"
                    style={{ backgroundColor: `${primary}10`, borderColor: `${primary}30` }}
                  >
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Resumo</p>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center gap-2 text-gray-700 min-w-0">
                        <User className="w-4 h-4 flex-shrink-0" style={{ color: primary }} />
                        <span className="truncate">{selectedProfessionalData?.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 min-w-0">
                        <Briefcase className="w-4 h-4 flex-shrink-0" style={{ color: primary }} />
                        <span className="truncate">{selectedServiceData?.name}</span>
                      </div>
                      {selectedOptionData && (
                        <div className="flex items-center gap-2 text-gray-700 min-w-0">
                          <Package className="w-4 h-4 flex-shrink-0" style={{ color: primary }} />
                          <span className="truncate">{selectedOptionData.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-700 min-w-0">
                        <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: primary }} />
                        <span className="truncate capitalize">{formatDateLabel(selectedDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-4 h-4 flex-shrink-0" style={{ color: primary }} />
                        <span>{selectedSlot}</span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Seu nome</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition text-sm"
                        placeholder="Como podemos te chamar?"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Telefone ou e-mail</label>
                      <input
                        type="text"
                        value={customerContact}
                        onChange={(e) => setCustomerContact(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition text-sm"
                        placeholder="(11) 99999-9999 ou seu@email.com"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                      style={{ backgroundColor: primary }}
                    >
                      {submitting ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                          Confirmando...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Confirmar agendamento
                        </>
                      )}
                    </button>
                  </form>
                </section>
              )}

            {/* Começar de novo */}
            {(selectedProfessional || selectedService || selectedDate) && (
              <button
                onClick={resetAll}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2 inline-flex items-center justify-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Começar de novo
              </button>
            )}
          </div>
        )}
      </main>

      {/* Rodapé */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-2xl mx-auto px-4 py-5 md:py-6 text-center">
          {(tenant.phone || tenant.address) && (
            <div className="space-y-1.5 mb-3 text-xs md:text-sm text-gray-600">
              {tenant.phone && (
                <p className="inline-flex items-center gap-1.5 justify-center">
                  <Phone className="w-4 h-4" style={{ color: primary }} />
                  {tenant.phone}
                </p>
              )}
              {tenant.address && (
                <p className="inline-flex items-center gap-1.5 justify-center">
                  <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: primary }} />
                  {tenant.address}
                </p>
              )}
            </div>
          )}
          <p className="text-xs text-gray-400">
            Agendamento online por{' '}
            <span className="font-medium" style={{ color: primary }}>
              Agendy
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}

// Botão de slot (horário)
function SlotButton({
  slot,
  isSelected,
  primary,
  onClick,
}: {
  slot: string;
  isSelected: boolean;
  primary: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-2 rounded-lg border text-xs md:text-sm font-medium transition ${isSelected ? 'text-white' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
        }`}
      style={isSelected ? { backgroundColor: primary, borderColor: primary } : {}}
    >
      {slot}
    </button>
  );
}