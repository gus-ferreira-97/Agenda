import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
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
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!enabled) {
        setPlan(null);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const resp = await api.get('/tenants/me/plan', { signal });
        setPlan(resp.data);
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError('Não foi possível carregar o plano.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [enabled],
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return { plan, loading, error, reload: () => load() };
}