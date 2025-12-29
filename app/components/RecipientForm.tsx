"use client";

import { FormEvent, useState } from "react";
import type { Recipient } from "@/types";

type RecipientFormProps = {
  onSubmit: (recipient: Recipient) => void;
};

export function RecipientForm({ onSubmit }: RecipientFormProps) {
  const [handle, setHandle] = useState("");
  const [igUserId, setIgUserId] = useState("");
  const [name, setName] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const reset = () => {
    setHandle("");
    setIgUserId("");
    setName("");
    setTagInput("");
    setTags([]);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!handle || !igUserId || !name) return;
    onSubmit({
      id: crypto.randomUUID(),
      handle: handle.replace(/^@/, "").trim(),
      igUserId: igUserId.trim(),
      name: name.trim(),
      tags,
      status: "idle",
      createdAt: new Date().toISOString(),
    });
    reset();
  };

  const handleTagKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || !tagInput.trim()) return;
    event.preventDefault();
    setTags((current) => Array.from(new Set([...current, tagInput.trim()])));
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags((current) => current.filter((value) => value !== tag));
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      <div className="grid two">
        <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <span style={{ fontSize: "0.8rem", color: "rgba(148,163,184,0.75)" }}>Instagram handle</span>
          <input
            placeholder="@influencer"
            value={handle}
            onChange={(event) => setHandle(event.target.value)}
            required
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <span style={{ fontSize: "0.8rem", color: "rgba(148,163,184,0.75)" }}>Instagram user id</span>
          <input
            placeholder="Numeric ID from Meta Graph API"
            value={igUserId}
            onChange={(event) => setIgUserId(event.target.value)}
            required
          />
        </label>
      </div>

      <div className="grid two">
        <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <span style={{ fontSize: "0.8rem", color: "rgba(148,163,184,0.75)" }}>Contact name</span>
          <input
            placeholder="Full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <span style={{ fontSize: "0.8rem", color: "rgba(148,163,184,0.75)" }}>Tag (press enter to add)</span>
          <div className="tag-input">
            {tags.map((tag) => (
              <span className="tag-chip" key={tag}>
                {tag}
                <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
                  ×
                </button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={handleTagKeyUp}
              placeholder="Partnership"
            />
          </div>
        </label>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
        <button type="submit" className="primary">
          Add recipient
        </button>
      </div>
    </form>
  );
}
