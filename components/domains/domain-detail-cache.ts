"use client";

import type { DomainDetailPayload } from "@/lib/domain-detail";

const TTL_MS = 5 * 60 * 1000;
const storagePrefix = "domain-detail:";
const memory = new Map<string, { payload: DomainDetailPayload; expiresAt: number }>();
const inflight = new Map<string, Promise<DomainDetailPayload>>();

export function getCachedDomainDetail(id: string): DomainDetailPayload | null {
  const cached = memory.get(id);
  if (cached && cached.expiresAt > Date.now()) return cached.payload;

  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(`${storagePrefix}${id}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { payload: DomainDetailPayload; expiresAt: number };
    if (!parsed.expiresAt || parsed.expiresAt <= Date.now()) {
      window.sessionStorage.removeItem(`${storagePrefix}${id}`);
      return null;
    }
    memory.set(id, parsed);
    return parsed.payload;
  } catch {
    return null;
  }
}

export function setCachedDomainDetail(id: string, payload: DomainDetailPayload) {
  const entry = { payload, expiresAt: Date.now() + TTL_MS };
  memory.set(id, entry);
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(`${storagePrefix}${id}`, JSON.stringify(entry));
  } catch {
    // Storage can be unavailable in private modes; memory cache still covers this tab.
  }
}

export function invalidateDomainDetail(id: string) {
  memory.delete(id);
  inflight.delete(id);
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(`${storagePrefix}${id}`);
  } catch {}
}

export async function prefetchDomainDetail(id: string): Promise<DomainDetailPayload> {
  const cached = getCachedDomainDetail(id);
  if (cached) return cached;

  const pending = inflight.get(id);
  if (pending) return pending;

  const request = fetch(`/api/domains/${id}`, {
    headers: { Accept: "application/json" },
    credentials: "same-origin",
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(`Failed to load domain ${id}`);
      const payload = (await res.json()) as DomainDetailPayload;
      setCachedDomainDetail(id, payload);
      return payload;
    })
    .finally(() => inflight.delete(id));

  inflight.set(id, request);
  return request;
}
