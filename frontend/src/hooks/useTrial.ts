import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
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

/** Intervalo de polling em background (ms). */
const REVALIDATE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

export function useTrial(enabled: boolean = true) {
  const [trial, setTrial] = useState<TrialInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!enabled) {
        setTrial(null);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        const resp = await api.get('/tenants/me/trial', { signal });
        setTrial(resp.data);
        setError(null);
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

  // Carga inicial no mount
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  // Revalida em cada mudança de rota (navegação SPA)
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [location.pathname, enabled, load]);

  // Polling em background a cada 5 min (detecta expiração durante sessão parada)
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      const controller = new AbortController();
      load(controller.signal);
    }, REVALIDATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [enabled, load]);

  return { trial, loading, error, reload: () => load() };
}