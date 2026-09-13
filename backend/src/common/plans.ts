export type PlanKey = 'basico' | 'profissional' | 'premium';

export interface PlanDefinition {
  key: PlanKey;
  name: string;
  maxProfessionals: number | null; // null = ilimitado
  allowBranding: boolean;
  allowAdvancedReports: boolean;
  allowPrioritySupport: boolean;
}

export const PLANS: Record<PlanKey, PlanDefinition> = {
  basico: {
    key: 'basico',
    name: 'Básico',
    maxProfessionals: 1,
    allowBranding: false,
    allowAdvancedReports: false,
    allowPrioritySupport: false,
  },
  profissional: {
    key: 'profissional',
    name: 'Profissional',
    maxProfessionals: 5,
    allowBranding: true,
    allowAdvancedReports: true,
    allowPrioritySupport: false,
  },
  premium: {
    key: 'premium',
    name: 'Premium',
    maxProfessionals: null,
    allowBranding: true,
    allowAdvancedReports: true,
    allowPrioritySupport: true,
  },
};

export function getPlan(planKey: string): PlanDefinition {
  if (planKey in PLANS) {
    return PLANS[planKey as PlanKey];
  }
  // Fallback: se o plano for desconhecido, assume básico
  return PLANS.basico;
}