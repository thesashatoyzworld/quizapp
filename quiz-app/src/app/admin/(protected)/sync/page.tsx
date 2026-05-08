"use client";

import { useEffect, useState } from "react";

interface SyncEntry {
  id: number;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  tier: string;
  createdAt: string;
}

const TIER_LABELS: Record<string, { label: string; color: string }> = {
  easy: { label: "ИЗИ", color: "#22c55e" },
  mid: { label: "МИД", color: "#f59e0b" },
  hard: { label: "ХАРД", color: "#ef4444" },
};

export default function SyncAdminPage() {
  const [entries, setEntries] = useState<SyncEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/sync-waitlist")
      .then((r) => r.json())
      .then((data) => {
        setEntries(data);
        setLoading(false);
      });
  }, []);

  const filtered = filter === "all" ? entries : entries.filter((e) => e.tier === filter);

  const counts = {
    all: entries.length,
    easy: entries.filter((e) => e.tier === "easy").length,
    mid: entries.filter((e) => e.tier === "mid").length,
    hard: entries.filter((e) => e.tier === "hard").length,
  };

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
            color: "var(--neon-cyan)",
            letterSpacing: "0.1em",
            marginBottom: "8px",
          }}
        >
          SYNC Waitlist
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
          Лист ожидания SYNC Community
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        {(["all", "easy", "mid", "hard"] as const).map((key) => {
          const tier = key === "all" ? null : TIER_LABELS[key];
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: "12px 20px",
                borderRadius: "8px",
                border: `1px solid ${filter === key ? "rgba(0, 240, 255, 0.3)" : "rgba(255,255,255,0.06)"}`,
                background: filter === key ? "rgba(0, 240, 255, 0.05)" : "var(--bg-secondary)",
                color: tier ? tier.color : "var(--text-primary)",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{counts[key]}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                {key === "all" ? "Всего" : tier!.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Загрузка...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>Пока нет записей</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.875rem",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                color: "var(--text-muted)",
                textAlign: "left",
              }}
            >
              <th style={{ padding: "10px 12px", fontWeight: 500 }}>Имя</th>
              <th style={{ padding: "10px 12px", fontWeight: 500 }}>Username</th>
              <th style={{ padding: "10px 12px", fontWeight: 500 }}>Тариф</th>
              <th style={{ padding: "10px 12px", fontWeight: 500 }}>Telegram ID</th>
              <th style={{ padding: "10px 12px", fontWeight: 500 }}>Дата</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => {
              const tier = TIER_LABELS[entry.tier] || {
                label: entry.tier,
                color: "#888",
              };
              return (
                <tr
                  key={entry.id}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.03)",
                  }}
                >
                  <td style={{ padding: "10px 12px", color: "var(--text-primary)" }}>
                    {entry.firstName || "—"}
                  </td>
                  <td style={{ padding: "10px 12px", color: "var(--text-secondary)" }}>
                    {entry.username ? `@${entry.username}` : "—"}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 10px",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: tier.color,
                        background: `${tier.color}15`,
                        border: `1px solid ${tier.color}30`,
                      }}
                    >
                      {tier.label}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      color: "var(--text-muted)",
                      fontFamily: "monospace",
                      fontSize: "0.8rem",
                    }}
                  >
                    {entry.telegramId}
                  </td>
                  <td style={{ padding: "10px 12px", color: "var(--text-muted)" }}>
                    {new Date(entry.createdAt).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
