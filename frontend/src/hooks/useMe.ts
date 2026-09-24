import { useEffect, useState, useCallback } from 'react';
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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await api.get('/users/me');
      setMe(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { me, loading, reload: load };
}