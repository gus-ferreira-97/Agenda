import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';

export interface PlanInfo {
  plan: string;
  planName: string;
  maxProfessionals: number | null;
  currentProfessionals: number;
  allowBranding: boolean;
  allowAdvancedReports: boolean;
  allowPrioritySupport: boolean;
}

export function usePlan(enabled: boolean = true) {
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!enabled) {
      setPlan(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const resp = await api.get('/tenants/me/plan');
      setPlan(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    load();
  }, [load]);

  return { plan, loading, reload: load };
}