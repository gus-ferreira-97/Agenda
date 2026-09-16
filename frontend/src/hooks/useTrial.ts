import { useEffect, useState, useCallback } from 'react';
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

  const load = useCallback(async () => {
    if (!enabled) {
      setTrial(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const resp = await api.get('/tenants/me/trial');
      setTrial(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    load();
  }, [load]);

  return { trial, loading, reload: load };
}