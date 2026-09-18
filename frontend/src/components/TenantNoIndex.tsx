import { useEffect } from 'react';

export default function TenantNoIndex() {
  useEffect(() => {
    const hostname = window.location.hostname;

    // Ignora ambientes locais de desenvolvimento
    if (hostname === 'localhost' || hostname.startsWith('127.')) {
      return;
    }

    const parts = hostname.split('.');

    // Regras:
    // - agendyapp.com.br          → 2 partes → domínio raiz (indexa)
    // - www.agendyapp.com.br      → 3 partes, primeira "www" → domínio raiz (indexa)
    // - barbeariadoze.agendyapp.com.br → 3 partes, primeira é tenant → NÃO indexa
    // - barbeariadoze.Agendy.local  → 3 partes (dev com hosts) → NÃO indexa
    const isTenantSubdomain = parts.length >= 3 && parts[0] !== 'www';

    if (!isTenantSubdomain) return;

    // Atualiza (ou cria) a meta tag de robots
    let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'noindex, nofollow');
  }, []);

  return null;
}