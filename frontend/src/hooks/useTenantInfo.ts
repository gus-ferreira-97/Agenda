import { useEffect, useState, useCallback } from 'react';
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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await api.get('/tenants/me/branding');
      setTenant(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { tenant, loading, reload: load };
}