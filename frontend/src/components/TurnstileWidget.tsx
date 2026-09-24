import { forwardRef } from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

export const TurnstileWidget = forwardRef<TurnstileInstance, TurnstileWidgetProps>(
  ({ onSuccess, onError, onExpire }, ref) => {
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

    if (!siteKey) {
      console.error(
        '[Turnstile] VITE_TURNSTILE_SITE_KEY não está definida. O CAPTCHA não vai funcionar.',
      );
      return (
        <div style={{ padding: 8, color: '#b91c1c', fontSize: 13 }}>
          ⚠️ CAPTCHA não configurado (chave ausente)
        </div>
      );
    }

    return (
      <Turnstile
        ref={ref}
        siteKey={siteKey}
        options={{
          theme: 'auto',
          size: 'normal',
        }}
        onSuccess={onSuccess}
        onError={() => {
          console.error('[Turnstile] Erro ao carregar');
          onError?.();
        }}
        onExpire={() => {
          console.warn('[Turnstile] Token expirado, precisa ser renovado');
          onExpire?.();
        }}
      />
    );
  },
);

TurnstileWidget.displayName = 'TurnstileWidget';