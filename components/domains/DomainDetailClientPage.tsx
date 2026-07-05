"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { DomainDetailPayload } from "@/lib/domain-detail";
import DomainDetailInteractive from "./DomainDetailInteractive";
import DomainDetailSkeleton from "./DomainDetailSkeleton";
import { getCachedDomainDetail, prefetchDomainDetail } from "./domain-detail-cache";

export default function DomainDetailClientPage({ domainId }: { domainId: string }) {
  const [detail, setDetail] = useState<DomainDetailPayload | null>(() => getCachedDomainDetail(domainId));
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const cached = getCachedDomainDetail(domainId);
    if (cached) setDetail(cached);

    prefetchDomainDetail(domainId)
      .then((payload) => {
        if (!cancelled) {
          setDetail(payload);
          setError("");
        }
      })
      .catch(() => {
        if (!cancelled && !cached) setError("领域详情加载失败，请返回后重试");
      });

    return () => {
      cancelled = true;
    };
  }, [domainId]);

  if (!detail && !error) return <DomainDetailSkeleton />;

  if (!detail) {
    return (
      <div style={{ maxWidth: "38rem", margin: "0 auto" }}>
        <Link href="/domains" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "rgba(74,85,128,0.6)", textDecoration: "none", marginBottom: "1.25rem", letterSpacing: "0.05em" }}>
          ← 我的领域
        </Link>
        <div style={{ background: "#0c0c1e", border: "1px solid rgba(255,23,68,0.25)", borderRadius: 2, padding: "1rem", color: "#ff1744", fontSize: "0.875rem" }}>
          {error}
        </div>
      </div>
    );
  }

  const { domain } = detail;

  return (
    <div style={{ maxWidth: "38rem", margin: "0 auto" }}>
      <Link href="/domains" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "rgba(74,85,128,0.6)", textDecoration: "none", marginBottom: "1.25rem", letterSpacing: "0.05em", transition: "color 0.15s" }}>
        ← 我的领域
      </Link>

      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: domain.color, boxShadow: `0 0 8px ${domain.color}`, flexShrink: 0 }} />
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#dde4ff", letterSpacing: "0.1em", textTransform: "uppercase", flex: 1 }}>
            {domain.name}
          </h1>
          {domain.icon && <span style={{ fontSize: "1.25rem" }}>{domain.icon}</span>}
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg,${domain.color}60,transparent 60%)` }} />
      </div>

      <DomainDetailInteractive
        key={`${domain.id}:${detail.initialTotalMinutes}:${detail.weeklyAvgMinutes}:${domain.targetDate ?? ""}:${detail.initialSessions[0]?.id ?? ""}`}
        domainId={domain.id}
        domainColor={domain.color}
        targetHours={domain.targetHours}
        targetDate={domain.targetDate ? new Date(domain.targetDate) : null}
        initialTotalMinutes={detail.initialTotalMinutes}
        weeklyAvgMinutes={detail.weeklyAvgMinutes}
        initialSessions={detail.initialSessions}
      />
    </div>
  );
}
