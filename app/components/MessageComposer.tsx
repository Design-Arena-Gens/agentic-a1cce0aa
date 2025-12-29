"use client";

import { useMemo } from "react";
import { buildMessage, extractVariables } from "@/lib/messageBuilder";
import type { Recipient, TemplateVariable } from "@/types";

interface MessageComposerProps {
  template: string;
  onTemplateChange: (value: string) => void;
  selectedRecipient: Recipient | null;
  customVariables: Record<string, string>;
  onCustomVariableChange: (key: string, value: string) => void;
  variableCatalog: TemplateVariable[];
}

export function MessageComposer({
  template,
  onTemplateChange,
  selectedRecipient,
  customVariables,
  onCustomVariableChange,
  variableCatalog,
}: MessageComposerProps) {
  const preview = useMemo(() => {
    if (!selectedRecipient) return null;
    return buildMessage({
      template,
      recipient: selectedRecipient,
      customVariables,
    });
  }, [customVariables, selectedRecipient, template]);

  const activeVariables = useMemo(() => extractVariables(template), [template]);

  return (
    <section className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Message Template</h2>
          <p style={{ margin: "0.35rem 0 0", color: "rgba(148,163,184,0.7)", fontSize: "0.9rem" }}>
            Use dynamic variables to personalise outreach at scale.
          </p>
        </div>
      </header>

      <textarea
        rows={6}
        value={template}
        onChange={(event) => onTemplateChange(event.target.value)}
        placeholder="Hey {{first_name}}! Loved your latest reel. I'd love to collaborate on..."
        style={{
          width: "100%",
          borderRadius: "12px",
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <strong style={{ fontSize: "0.9rem", opacity: 0.9 }}>Available variables</strong>
        <div className="grid three" style={{ gap: "0.75rem" }}>
          {variableCatalog.map((variable) => (
            <div
              key={variable.key}
              style={{
                background: "rgba(15, 23, 42, 0.55)",
                border: "1px solid rgba(148,163,184,0.15)",
                borderRadius: "12px",
                padding: "0.75rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <code style={{ fontSize: "0.8rem", color: "#a5b4fc" }}>{`{{${variable.key}}}`}</code>
                <span style={{ fontSize: "0.75rem", color: "rgba(148,163,184,0.65)" }}>{variable.label}</span>
              </div>
              <p style={{ marginTop: "0.5rem", marginBottom: 0, color: "rgba(148,163,184,0.7)", fontSize: "0.85rem" }}>
                {variable.description}
              </p>
              <p style={{ margin: "0.6rem 0 0", fontSize: "0.8rem", color: "rgba(148,163,184,0.5)" }}>
                e.g. <em>{variable.sample}</em>
              </p>
            </div>
          ))}
        </div>
      </div>

      {activeVariables.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            background: "rgba(99, 102, 241, 0.08)",
            border: "1px solid rgba(99, 102, 241, 0.25)",
            borderRadius: "14px",
            padding: "1rem",
          }}
        >
          <strong style={{ fontSize: "0.95rem" }}>Custom variables</strong>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(148,163,184,0.75)" }}>
            Override template values per campaign. These apply to every recipient.
          </p>
          <div className="grid two" style={{ gap: "0.75rem" }}>
            {activeVariables.map((variable) => {
              const matching = variableCatalog.find((candidate) => candidate.key === variable);
              return (
                <label key={variable} style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <span style={{ fontSize: "0.8rem", color: "rgba(148,163,184,0.75)" }}>
                    {matching?.label ?? variable}
                  </span>
                  <input
                    value={customVariables[variable] ?? ""}
                    onChange={(event) => onCustomVariableChange(variable, event.target.value)}
                    placeholder={matching?.sample ?? "Value"}
                  />
                </label>
              );
            })}
          </div>
        </div>
      )}

      <div
        style={{
          background: "rgba(15, 23, 42, 0.55)",
          border: "1px solid rgba(148,163,184,0.15)",
          borderRadius: "16px",
          padding: "1rem",
        }}
      >
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "1rem" }}>Live Preview</h3>
          {selectedRecipient ? (
            <span style={{ fontSize: "0.8rem", color: "rgba(148,163,184,0.7)" }}>
              Targeting <strong>@{selectedRecipient.handle}</strong>
            </span>
          ) : (
            <span style={{ fontSize: "0.8rem", color: "rgba(148,163,184,0.5)" }}>
              Select a recipient to preview personalised copy
            </span>
          )}
        </header>
        <div
          style={{
            marginTop: "0.75rem",
            background: "rgba(99, 102, 241, 0.08)",
            borderRadius: "14px",
            padding: "1rem",
            minHeight: "140px",
            border: "1px dashed rgba(99, 102, 241, 0.35)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.6, color: "rgba(226,232,240,0.9)" }}>
            {preview ?? "Your personalised message will render here."}
          </p>
        </div>
      </div>
    </section>
  );
}
