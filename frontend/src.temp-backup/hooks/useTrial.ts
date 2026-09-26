import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import api from '../services/api';

export interface TrialInfo {
  isTrial: boolean;
  isExpired: boolean;
  daysLeft: number;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  status: string;
  plan: string;
}

export function useTrial(enabled: boolean = true) {
  const [trial, setTrial] = useState<TrialInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!enabled) {
        setTrial(null);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const resp = await api.get('/tenants/me/trial', { signal });
        setTrial(resp.data);
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError('Não foi possível carregar informações do trial.');
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

  return { trial, loading, error, reload: () => load() };
}