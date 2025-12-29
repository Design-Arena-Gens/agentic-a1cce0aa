"use client";

interface StatsPanelProps {
  queued: number;
  sent: number;
  failed: number;
}

export function StatsPanel({ queued, sent, failed }: StatsPanelProps) {
  const items = [
    {
      label: "Queued",
      value: queued,
      accent: "rgba(250, 204, 21, 0.5)",
      description: "Messages scheduled for delivery",
    },
    {
      label: "Delivered",
      value: sent,
      accent: "rgba(34, 197, 94, 0.45)",
      description: "Successful Instagram deliveries",
    },
    {
      label: "Attention",
      value: failed,
      accent: "rgba(239, 68, 68, 0.45)",
      description: "Requires manual follow-up",
    },
  ];

  return (
    <section className="grid three" style={{ gap: "1rem" }}>
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            background: "var(--surface-strong)",
            borderRadius: "18px",
            padding: "1.25rem",
            border: `1px solid ${item.accent}`,
            backdropFilter: "blur(15px)",
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
          }}
        >
          <span style={{ fontSize: "0.8rem", color: "rgba(148,163,184,0.6)", letterSpacing: "0.08em" }}>
            {item.label}
          </span>
          <strong style={{ fontSize: "2rem" }}>{item.value}</strong>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(148,163,184,0.7)" }}>{item.description}</p>
        </div>
      ))}
    </section>
  );
}
