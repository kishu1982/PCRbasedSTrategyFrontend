import { ConfigInput, LiveStrategy, PcrConfig } from "./types";

const BASE = (process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/+$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BASE) {
    throw new Error(
      "NEXT_PUBLIC_BASE_URL is not set. Check .env, then fully restart `npm run dev`.",
    );
  }
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} ${text.slice(0, 300)}`);
  }
  return res.json();
}

export const getConfigs = () => request<PcrConfig[]>("/pcr-strategy/config");

export const getLive = () => request<LiveStrategy[]>("/pcr-strategy/live");

export const createConfig = (body: ConfigInput) =>
  request<PcrConfig>("/pcr-strategy/config", {
    method: "POST",
    body: JSON.stringify(body),
  });

// PATCH: send only the fields that changed
export const updateConfig = (id: string, body: Partial<ConfigInput>) =>
  request<PcrConfig>(`/pcr-strategy/config/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

// delete config

export const deleteConfig = (id: string) =>
  request<void>(`/pcr-strategy/config/${id}`, { method: "DELETE" });

// for refreshing instruments data from the exchange, this is a long-running operation so we don't wait for it to finish
export const refreshInstruments = () =>
  request<unknown>("/market/refresh-instruments");
