import { useEffect, useState } from "react";

// Reuse the env-based API base the same way we logged it
const API_BASE = import.meta.env.VITE_API_BASE as string;

type Plan = {
  id?: string;
  name?: string;
  amount?: number;
  count?: number;
  nextDue?: string | Date;
  status?: string;
  meta?: Record<string, unknown>;
};

type UsePlansResult = {
  loading: boolean;
  error: string | null;
  plans: Plan[];
  refresh: () => Promise<void>;
};

async function tryFetch(url: string): Promise<Response> {
  const r = await fetch(url, { headers: { "Content-Type": "application/json" } });
  return r;
}

async function fetchPlans(): Promise<Plan[]> {
  if (!API_BASE) throw new Error("VITE_API_BASE is missing");

  // Try common paths: /api/plans then /plans
  const candidates = [`${API_BASE}/api/plans`, `${API_BASE}/plans`];

  let lastErr: any;
  for (const url of candidates) {
    try {
      const r = await tryFetch(url);
      if (r.ok) {
        const data = await r.json().catch(() => ([]));
        // Normalize a bit
        return Array.isArray(data) ? data : (data.plans ?? []);
      } else {
        lastErr = new Error(`HTTP ${r.status} @ ${url}`);
      }
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("Failed to fetch plans");
}

export function usePlans(): UsePlansResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchPlans();
      setPlans(list ?? []);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { loading, error, plans, refresh: load };
}
