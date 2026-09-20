import { Lock, Sparkles, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';


export default function TrialBlockedScreen() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-red-600" />
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          Seu período de teste terminou
        </h1>
        <p className="text-sm text-gray-600 mb-8">
          Esperamos que você tenha gostado do Agendy! Para continuar usando,
          é só ativar sua assinatura. Entre em contato com a gente que te ajudamos
          com o próximo passo.
        </p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3">
          <a
            href="https://wa.me/5511986698398?text=Ol%C3%A1%2C%20quero%20ativar%20minha%20assinatura%20do%20Agendy"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            <MessageCircle className="w-4 h-4" />
            Falar no WhatsApp
          </a>

          <a
            href="mailto:gustavoferreyra43@gmail.com?subject=Quero%20ativar%20minha%20assinatura"
            className="w-full inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            <Sparkles className="w-4 h-4" />
            Enviar e-mail
          </a>
        </div>

        <button
          onClick={logout}
          className="mt-6 text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Sair da conta
        </button>
      </div>
    </div>
  );
}