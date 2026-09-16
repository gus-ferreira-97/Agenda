import { LogOut, Clock } from 'lucide-react';

interface IdleWarningModalProps {
  show: boolean;
  secondsLeft: number;
  onStay: () => void;
  onLogout: () => void;
}

export default function IdleWarningModal({
  show,
  secondsLeft,
  onStay,
  onLogout,
}: IdleWarningModalProps) {
  if (!show) return null;

  // Formata o tempo como "1:00" ou "0:45"
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in-up">
        {/* Ícone */}
        <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-7 h-7 text-yellow-600" />
        </div>

        {/* Título e texto */}
        <h2 className="text-lg md:text-xl font-bold text-gray-900 text-center mb-2">
          Sua sessão vai expirar
        </h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Por segurança, você será desconectado por inatividade em:
        </p>

        {/* Countdown */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg py-4 mb-6 text-center">
          <span className="text-3xl font-bold text-gray-900 font-mono tabular-nums">
            {timeFormatted}
          </span>
        </div>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onLogout}
            className="flex-1 inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            <LogOut className="w-4 h-4" />
            Sair agora
          </button>
          <button
            type="button"
            onClick={onStay}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Continuar logado
          </button>
        </div>
      </div>
    </div>
  );
}