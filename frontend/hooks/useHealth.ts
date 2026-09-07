import { useState, useEffect } from 'react';
import { checkHealth } from '../lib/api/health';

export function useHealth() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await checkHealth();
        setStatus(res.status);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchHealth();
  }, []);

  return { status, loading, error };
}
