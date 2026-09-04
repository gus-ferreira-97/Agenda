import { useEffect, useState } from 'react';
import api from '../services/api';

const TENANT_ID = 1; // temporário

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

export default function PublicBooking() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<number | ''>('');
  const [selectedService, setSelectedService] = useState<number | ''>('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [profResp, servResp] = await Promise.all([
          api.get('/public/professionals', { params: { tenantId: TENANT_ID } }),
          api.get('/public/services', { params: { tenantId: TENANT_ID } }),
        ]);
        setProfessionals(profResp.data);
        setServices(servResp.data);
      } catch (err) {
        setError('Erro ao carregar dados.');
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProfessional && selectedService && selectedDate) {
      setLoadingSlots(true);
      setError('');
      api
        .get('/public/available-slots', {
          params: {
            tenantId: TENANT_ID,
            professionalId: selectedProfessional,
            serviceId: selectedService,
            date: selectedDate,
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
  }, [selectedProfessional, selectedService, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!selectedProfessional || !selectedService || !selectedDate || !selectedSlot) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      await api.post('/public/appointments', {
        tenantId: TENANT_ID,
        professionalId: Number(selectedProfessional),
        serviceId: Number(selectedService),
        customerName,
        customerContact,
        startTime: `${selectedDate}T${selectedSlot}:00`,
      });
      setMessage('Agendamento realizado com sucesso!');
      setCustomerName('');
      setCustomerContact('');
      setSelectedSlot('');
      // Recarrega slots para remover o horário ocupado
      if (selectedProfessional && selectedService && selectedDate) {
        const resp = await api.get('/public/available-slots', {
          params: {
            tenantId: TENANT_ID,
            professionalId: selectedProfessional,
            serviceId: selectedService,
            date: selectedDate,
          },
        });
        setAvailableSlots(resp.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao realizar agendamento.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-800">Agendar Serviço</h1>

        {/* Profissional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Profissional</label>
          <select
            value={selectedProfessional}
            onChange={(e) => setSelectedProfessional(e.target.value ? Number(e.target.value) : '')}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Selecione...</option>
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} - {p.specialty}
              </option>
            ))}
          </select>
        </div>

        {/* Serviço */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Serviço</label>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value ? Number(e.target.value) : '')}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Selecione...</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} - {s.duration_minutes} min {s.price ? `- R$ ${s.price}` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Data */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full border rounded px-3 py-2"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Horários disponíveis */}
        {loadingSlots && <p className="text-sm text-gray-500">Carregando horários...</p>}
        {!loadingSlots && selectedProfessional && selectedService && selectedDate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Horários disponíveis</label>
            {availableSlots.length === 0 ? (
              <p className="text-sm text-red-500">Nenhum horário disponível para essa data.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 rounded border ${
                      selectedSlot === slot
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-blue-100'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dados do cliente */}
        {selectedSlot && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seu nome</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / Email</label>
              <input
                type="text"
                value={customerContact}
                onChange={(e) => setCustomerContact(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Confirmar Agendamento
            </button>
          </form>
        )}

        {message && <p className="text-green-600 text-center">{message}</p>}
        {error && <p className="text-red-600 text-center">{error}</p>}
      </div>
    </div>
  );
}