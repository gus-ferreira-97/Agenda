import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import api from '../services/api';

export interface MeInfo {
  id: number;
  name: string;
  email: string;
  role: string;
  tenant_id: number | null;
  created_at: string;
  updated_at: string;
}

export function useMe() {
  const [me, setMe] = useState<MeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await api.get('/users/me', { signal });
      setMe(resp.data);
    } catch (err) {
      if (axios.isCancel(err)) return;
      setError('Não foi possível carregar seus dados.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return { me, loading, error, reload: () => load() };
}