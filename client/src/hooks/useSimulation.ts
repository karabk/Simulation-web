import { useEffect, useState } from 'react';
import { ApiScenario } from '../types/api';
import { API_BASE } from '../config';

export function useSimulationList() {
  const [scenarios, setScenarios] = useState<ApiScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`${API_BASE}/api/simulations/list`)
      .then(r => r.json())
      .then(d => { if (!cancelled) setScenarios(d.scenarios || []); })
      .catch(e => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { scenarios, loading, error };
}
