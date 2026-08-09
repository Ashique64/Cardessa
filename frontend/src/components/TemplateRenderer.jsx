"use client";

import React from "react";
import { getTemplateComponent } from "@/templates/registry";

/**
 * TemplateRenderer
 *
 * The single component used in all three contexts:
 *   1. /templates/[slug]   — public preview, pass `content={template.demo_content}`
 *   2. /editor/[slug]      — live preview pane, pass `content={editorContent}`
 *   3. /i/[slug]           — final guest invitation, pass `content={invitation.content}`
 *
 * Props:
 *   componentKey  {string}    — template.component_key from the backend
 *   content       {object}    — content dict keyed by template.field_schema field keys
 *   mode          {string}    — "live" | "preview" | "editor"  (default: "live")
 *   onRsvpSubmit  {function}  — async (rsvpData) => void (used in "live" mode only)
 */
export default function TemplateRenderer({
  componentKey,
  content = {},
  mode = "live",
  onRsvpSubmit,
  hideBranding = false,
}) {
  const TemplateComponent = getTemplateComponent(componentKey);

  if (!TemplateComponent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-75 p-8 text-center bg-zinc-50 border border-zinc-200 rounded-2xl gap-3">
        <div className="h-10 w-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 text-lg">⚠</div>
        <div>
          <p className="text-sm font-semibold text-zinc-700">Template not found</p>
          <p className="text-xs text-zinc-400 mt-1">
            Component key <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs font-mono">{componentKey}</code> is not registered.
          </p>
          {process.env.NODE_ENV === "development" && (
            <p className="text-xs text-zinc-400 mt-2">
              Add it to <code className="bg-zinc-100 px-1.5 py-0.5 rounded font-mono">src/templates/registry.js</code>.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <TemplateComponent
      content={content}
      mode={mode}
      onRsvpSubmit={onRsvpSubmit}
      hideBranding={hideBranding}
    />
  );
}
