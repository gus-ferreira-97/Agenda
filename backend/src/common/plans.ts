export type PlanKey = 'basico' | 'profissional' | 'premium';

export interface PlanFeature {
  text: string;
}

export interface PlanDefinition {
  key: PlanKey;
  name: string;
  price: number; // preço em reais
  tagline: string; // subtítulo curto do plano
  features: string[]; // lista de recursos exibidos
  ctaLabel: string; // texto do botão de CTA
  isPopular: boolean; // destaque visual
  maxProfessionals: number | null; // null = ilimitado
  allowBranding: boolean;
  allowAdvancedReports: boolean;
  allowPrioritySupport: boolean;
}

export const PLANS: Record<PlanKey, PlanDefinition> = {
  basico: {
    key: 'basico',
    name: 'Básico',
    price: 49,
    tagline: 'Para quem está começando',
    features: [
      '1 profissional',
      'Serviços ilimitados',
      'Link público de agendamento',
      'Painel de agendamentos',
    ],
    ctaLabel: 'Começar grátis',
    isPopular: false,
    maxProfessionals: 1,
    allowBranding: false,
    allowAdvancedReports: false,
    allowPrioritySupport: false,
  },
  profissional: {
    key: 'profissional',
    name: 'Profissional',
    price: 89,
    tagline: 'Para salões em crescimento',
    features: [
      'Até 5 profissionais',
      'Serviços ilimitados',
      'Link público de agendamento',
      'Painel completo de gestão',
      'Suporte por e-mail',
    ],
    ctaLabel: 'Assinar agora',
    isPopular: true,
    maxProfessionals: 5,
    allowBranding: true,
    allowAdvancedReports: true,
    allowPrioritySupport: false,
  },
  premium: {
    key: 'premium',
    name: 'Premium',
    price: 149,
    tagline: 'Para estúdios e equipes grandes',
    features: [
      'Profissionais ilimitados',
      'Serviços ilimitados',
      'Link público de agendamento',
      'Painel completo de gestão',
      'Suporte prioritário',
      'Relatórios avançados',
    ],
    ctaLabel: 'Assinar agora',
    isPopular: false,
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
  return PLANS.basico;
}

/**
 * Retorna a lista de planos ordenada para exibição pública.
 * Removemos os campos internos (allowBranding, allowAdvancedReports, etc.)
 * que o frontend público não precisa saber.
 */
export function getPublicPlans() {
  const order: PlanKey[] = ['basico', 'profissional', 'premium'];
  return order.map((key) => {
    const plan = PLANS[key];
    return {
      key: plan.key,
      name: plan.name,
      price: plan.price,
      tagline: plan.tagline,
      features: plan.features,
      ctaLabel: plan.ctaLabel,
      isPopular: plan.isPopular,
    };
  });
}