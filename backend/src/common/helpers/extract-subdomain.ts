/**
 * Subdomínios reservados — nunca são tratados como tenant e não podem
 * ser registrados por usuários. Previnem impersonation e conflitos com
 * infraestrutura (www, api, admin, etc.).
 */
export const RESERVED_SUBDOMAINS = new Set<string>([
  // Web padrão
  'www',
  'web',
  'app',
  'm',
  'mobile',
  // API / infra
  'api',
  'api-v1',
  'api-v2',
  'graphql',
  'rest',
  'ws',
  'socket',
  'cdn',
  'static',
  'assets',
  'img',
  // Admin / painéis
  'admin',
  'painel',
  'dashboard',
  'console',
  'super',
  'superadmin',
  'root',
  // Comunicação
  'mail',
  'email',
  'smtp',
  'imap',
  'pop',
  'webmail',
  // Suporte / docs
  'help',
  'suporte',
  'support',
  'docs',
  'doc',
  'status',
  'health',
  // Segurança / dev
  'dev',
  'staging',
  'stage',
  'test',
  'tests',
  'homolog',
  'homologacao',
  'qa',
  'beta',
  'alpha',
  'sandbox',
  // Negócio
  'blog',
  'loja',
  'shop',
  'store',
  'pagamento',
  'checkout',
  'billing',
]);

/**
 * Verifica se um subdomínio é reservado (bloqueado para registro e acesso).
 */
export function isReservedSubdomain(subdomain: string): boolean {
  return RESERVED_SUBDOMAINS.has(subdomain.toLowerCase());
}

/**
 * Extrai o subdomínio de um Host header.
 * Retorna null quando não há subdomínio válido (ex.: "localhost",
 * "agendyapp.com.br", "www.agendyapp.com.br", IPs).
 *
 * Casos cobertos:
 *   "barbeariadoze.agendyapp.com.br"    → "barbeariadoze"      (produção)
 *   "barbeariadoze.agendyapp.com.br:443"→ "barbeariadoze"      (produção com porta)
 *   "barbeariadoze.localhost"           → "barbeariadoze"      (dev)
 *   "barbeariadoze.localhost:80"        → "barbeariadoze"      (dev com porta)
 *   "localhost"                         → null                 (dev sem tenant)
 *   "agendyapp.com.br"                  → null                 (raiz em produção)
 *   "www.agendyapp.com.br"              → null                 (reservado)
 *   "192.168.1.1"                       → null                 (IP, não hostname)
 *   undefined / ""                      → null
 */
export function extractSubdomain(host: string | undefined): string | null {
  if (!host) return null;

  // Remove a porta: "barbeariadoze.localhost:5173" → "barbeariadoze.localhost"
  const hostname = host.split(':')[0].toLowerCase();

  // Bloqueia IPs IPv4 — não têm subdomínio
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return null;
  }

  const parts = hostname.split('.');

  // Produção: "barbeariadoze.agendyapp.com.br" (3+ partes)
  if (parts.length >= 3) {
    return filterCandidate(parts[0]);
  }

  // Dev: "barbeariadoze.localhost" ou "barbeariadoze.local" (2 partes)
  if (
    parts.length === 2 &&
    ['localhost', 'local', 'localdomain'].includes(parts[1])
  ) {
    return filterCandidate(parts[0]);
  }

  // Sem subdomínio
  return null;
}

/**
 * Retorna o candidato se não for reservado, senão null.
 */
function filterCandidate(candidate: string): string | null {
  return isReservedSubdomain(candidate) ? null : candidate;
}