"use client";

import { useMemo } from "react";
import type { Recipient } from "@/types";

interface RecipientsTableProps {
  recipients: Recipient[];
  selectedIds: string[];
  toggleSelection: (id: string) => void;
  removeRecipient: (id: string) => void;
  setPrimarySelection: (id: string) => void;
}

const statusCopy: Record<Recipient["status"], string> = {
  idle: "Ready",
  scheduled: "Scheduled",
  sending: "Sending",
  sent: "Sent",
  failed: "Failed",
};

const statusBadgeClass: Record<Recipient["status"], string> = {
  idle: "badge",
  scheduled: "badge pending",
  sending: "badge pending",
  sent: "badge success",
  failed: "badge error",
};

export function RecipientsTable({
  recipients,
  selectedIds,
  toggleSelection,
  removeRecipient,
  setPrimarySelection,
}: RecipientsTableProps) {
  const empty = useMemo(() => recipients.length === 0, [recipients.length]);

  if (empty) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          color: "rgba(148,163,184,0.65)",
          border: "1px dashed rgba(148,163,184,0.3)",
          borderRadius: "16px",
          background: "rgba(15, 23, 42, 0.4)",
        }}
      >
        Start by adding recipients to power your automation.
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: "48px" }}>Send</th>
            <th>Recipient</th>
            <th>Tags</th>
            <th>Status</th>
            <th>Scheduled for</th>
            <th style={{ width: "90px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {recipients.map((recipient) => {
            const selected = selectedIds.includes(recipient.id);
            return (
              <tr key={recipient.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleSelection(recipient.id)}
                    aria-label={`Toggle ${recipient.handle}`}
                  />
                </td>
                <td style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                  <strong>@{recipient.handle}</strong>
                  <span style={{ fontSize: "0.8rem", color: "rgba(148,163,184,0.7)" }}>{recipient.name}</span>
                  <button
                    type="button"
                    onClick={() => setPrimarySelection(recipient.id)}
                    style={{
                      alignSelf: "flex-start",
                      fontSize: "0.75rem",
                      background: "transparent",
                      color: "rgba(99,102,241,0.9)",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Preview message
                  </button>
                </td>
                <td>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    {recipient.tags.map((tag) => (
                      <span className="badge" key={tag}>
                        #{tag}
                      </span>
                    ))}
                    {recipient.tags.length === 0 && (
                      <span style={{ fontSize: "0.8rem", color: "rgba(148,163,184,0.5)" }}>—</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={statusBadgeClass[recipient.status]}>{statusCopy[recipient.status]}</span>
                </td>
                <td>
                  {recipient.scheduledAt ? (
                    <time dateTime={recipient.scheduledAt}>
                      {new Date(recipient.scheduledAt).toLocaleString()}
                    </time>
                  ) : (
                    <span style={{ fontSize: "0.8rem", color: "rgba(148,163,184,0.5)" }}>Not scheduled</span>
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => removeRecipient(recipient.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(239,68,68,0.75)",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
