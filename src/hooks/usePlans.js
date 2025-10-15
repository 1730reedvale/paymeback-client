import { useEffect, useState } from "react";
// Reuse the env-based API base the same way we logged it
const API_BASE = import.meta.env.VITE_API_BASE;
async function tryFetch(url) {
    const r = await fetch(url, { headers: { "Content-Type": "application/json" } });
    return r;
}
async function fetchPlans() {
    if (!API_BASE)
        throw new Error("VITE_API_BASE is missing");
    // Try common paths: /api/plans then /plans
    const candidates = [`${API_BASE}/api/plans`, `${API_BASE}/plans`];
    let lastErr;
    for (const url of candidates) {
        try {
            const r = await tryFetch(url);
            if (r.ok) {
                const data = await r.json().catch(() => ([]));
                // Normalize a bit
                return Array.isArray(data) ? data : (data.plans ?? []);
            }
            else {
                lastErr = new Error(`HTTP ${r.status} @ ${url}`);
            }
        }
        catch (e) {
            lastErr = e;
        }
    }
    throw lastErr || new Error("Failed to fetch plans");
}
export function usePlans() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [plans, setPlans] = useState([]);
    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const list = await fetchPlans();
            setPlans(list ?? []);
        }
        catch (e) {
            setError(e?.message ?? String(e));
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return { loading, error, plans, refresh: load };
}
