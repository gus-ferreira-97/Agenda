/**
 * Utilitários compartilhados para trabalhar com JWT no frontend.
 * Usado pelo AuthContext e pelo Login (evita duplicação).
 */

/** Decodifica o payload de um JWT (sem verificar assinatura). */
export function decodeJwtPayload<T = any>(token: string): T | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/**
 * Verifica se um JWT ainda é válido (não expirou).
 * Margem de 10s para tolerar clock skew entre cliente e servidor.
 */
export function isTokenValid(token: string): boolean {
  const payload = decodeJwtPayload<{ exp?: number }>(token);
  if (!payload || typeof payload.exp !== 'number') return false;
  return payload.exp * 1000 > Date.now() + 10_000;
}