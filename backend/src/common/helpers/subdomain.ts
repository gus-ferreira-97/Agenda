import { BadRequestException } from '@nestjs/common';
import { isReservedSubdomain } from './extract-subdomain';

const MIN_SUBDOMAIN_LENGTH = 3;
const MAX_SUBDOMAIN_LENGTH = 63; // RFC 1035 — limite de label DNS

/**
 * Normaliza um subdomínio: lowercase, trim, remove caracteres inválidos,
 * colapsa hífens duplicados e remove hífens nas pontas.
 */
export function sanitizeSubdomain(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Valida um subdomínio já sanitizado.
 * Lança BadRequestException se inválido ou reservado.
 */
export function validateSubdomainOrThrow(subdomain: string): void {
  if (!subdomain || subdomain.length < MIN_SUBDOMAIN_LENGTH) {
    throw new BadRequestException(
      `Subdomínio inválido. Use pelo menos ${MIN_SUBDOMAIN_LENGTH} caracteres (letras, números, hífen).`,
    );
  }
  if (subdomain.length > MAX_SUBDOMAIN_LENGTH) {
    throw new BadRequestException(
      `Subdomínio muito longo. Máximo ${MAX_SUBDOMAIN_LENGTH} caracteres.`,
    );
  }
  if (isReservedSubdomain(subdomain)) {
    throw new BadRequestException(
      'Este subdomínio está reservado. Escolha outro.',
    );
  }
}