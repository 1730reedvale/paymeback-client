export const API_BASE = import.meta.env.VITE_API_BASE;

export async function api(path, init) {
  if (!API_BASE) throw new Error("VITE_API_BASE is missing");
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  return res;
}
