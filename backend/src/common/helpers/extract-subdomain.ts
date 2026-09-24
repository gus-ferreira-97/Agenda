/**
 * Extrai o subdomínio de um Host header.
 * Retorna null quando não há subdomínio (ex.: "localhost", "agendyapp.com.br").
 *
 * Casos cobertos:
 *   "barbeariadoze.agendyapp.com.br"    → "barbeariadoze"      (produção)
 *   "barbeariadoze.agendyapp.com.br:443"→ "barbeariadoze"      (produção com porta)
 *   "barbeariadoze.localhost"           → "barbeariadoze"      (dev)
 *   "barbeariadoze.localhost:80"        → "barbeariadoze"      (dev com porta)
 *   "localhost"                         → null                 (dev sem tenant)
 *   "agendyapp.com.br"                  → null                 (raiz em produção)
 *   undefined / ""                      → null
 */
export function extractSubdomain(host: string | undefined): string | null {
  if (!host) return null;

  // Remove a porta: "barbeariadoze.localhost:5173" → "barbeariadoze.localhost"
  const hostname = host.split(':')[0].toLowerCase();

  const parts = hostname.split('.');

  // Produção: "barbeariadoze.agendyapp.com.br" (3+ partes)
  if (parts.length >= 3) {
    return parts[0];
  }

  // Dev: "barbeariadoze.localhost" ou "barbeariadoze.local" (2 partes)
  if (
    parts.length === 2 &&
    ['localhost', 'local', 'localdomain'].includes(parts[1])
  ) {
    return parts[0];
  }

  // Sem subdomínio
  return null;
}