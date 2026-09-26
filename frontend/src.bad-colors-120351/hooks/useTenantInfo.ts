import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import api from '../services/api';

export interface TenantInfo {
  id: number;
  name: string;
  subdomain: string;
  primaryColor: string;
  logoUrl: string | null;
  welcomeMessage: string | null;
  phone: string | null;
  address: string | null;
}

export function useTenantInfo() {
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await api.get('/tenants/me/branding', { signal });
      setTenant(resp.data);
    } catch (err) {
      if (axios.isCancel(err)) return;
      setError('Não foi possível carregar informações da conta.');
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

  return { tenant, loading, error, reload: () => load() };
}