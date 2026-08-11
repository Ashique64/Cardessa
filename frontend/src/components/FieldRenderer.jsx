"use client";

import React, { useRef, useState } from "react";
import CustomSelect from "./CustomSelect";

// ─── Shared input style ──────────────────────────────────────────────────────
const inputCls =
  "w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#6B8E70]/30 focus:border-[#6B8E70] transition";

// ─── Individual field type renderers ────────────────────────────────────────

function TextField({ field, value, onChange }) {
  return (
    <input
      type="text"
      id={`field-${field.key}`}
      placeholder={field.label}
      maxLength={field.max_length || 255}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls}
    />
  );
}

function TextareaField({ field, value, onChange }) {
  return (
    <textarea
      id={`field-${field.key}`}
      placeholder={field.label}
      rows={3}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputCls} resize-none`}
    />
  );
}

function DateField({ field, value, onChange }) {
  return (
    <input
      type="date"
      id={`field-${field.key}`}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls}
    />
  );
}

function TimeField({ field, value, onChange }) {
  return (
    <input
      type="time"
      id={`field-${field.key}`}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls}
    />
  );
}

function ToggleField({ field, value, onChange }) {
  const on = value === true || value === "true";
  return (
    <button
      id={`field-${field.key}`}
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        on ? "bg-[#6B8E70]" : "bg-zinc-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
          on ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function SelectField({ field, value, onChange }) {
  const options = field.options || [];
  return (
    <CustomSelect
      value={value ?? ""}
      onChange={onChange}
      options={options.map((opt) => {
        const v = typeof opt === "object" ? opt.value : opt;
        const l = typeof opt === "object" ? opt.label : opt;
        return { value: v, label: l };
      })}
      placeholder={`Select ${field.label}…`}
    />
  );
}

// Locked palette color swatch picker (NOT a free picker — brand consistency)
function ColorField({ field, value, onChange }) {
  const palette = field.options || ["#C9A66B", "#7A8B6F", "#8E3B46", "#4A6FA5", "#2D6A4F"];
  return (
    <div className="flex flex-wrap gap-3" id={`field-${field.key}`}>
      {palette.map((hex) => (
        <button
          key={hex}
          type="button"
          title={hex}
          onClick={() => onChange(hex)}
          className="h-8 w-8 rounded-full border-2 transition-all duration-150 focus:outline-none"
          style={{
            backgroundColor: hex,
            borderColor: value === hex ? "#18181b" : "transparent",
            boxShadow: value === hex ? `0 0 0 3px ${hex}55` : "none",
            transform: value === hex ? "scale(1.15)" : "scale(1)",
          }}
          aria-label={`Select color ${hex}`}
          aria-pressed={value === hex}
        />
      ))}
    </div>
  );
}

// Single image upload — shows preview thumbnail, fires presign flow when DO Spaces configured
function ImageField({ field, value, onChange, onPresignUpload }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      if (onPresignUpload) {
        const url = await onPresignUpload(file, field.key, "image");
        onChange(url);
      } else {
        // Local dev fallback — object URL for preview only
        const localUrl = URL.createObjectURL(file);
        onChange(localUrl);
      }
    } catch (err) {
      console.error("Image upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div
        onClick={() => fileRef.current?.click()}
        className="relative w-full h-32 rounded-xl border-2 border-dashed border-zinc-200 hover:border-[#6B8E70] cursor-pointer flex items-center justify-center overflow-hidden transition-colors duration-200 bg-zinc-50"
        id={`field-${field.key}`}
      >
        {value ? (
          <img
            src={value}
            alt="Preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-zinc-400 pointer-events-none">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-xs font-medium">{uploading ? "Uploading…" : "Click to upload"}</span>
            {field.aspect_ratio && (
              <span className="text-[10px] text-zinc-300">{field.aspect_ratio} ratio</span>
            )}
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="h-5 w-5 border-2 border-[#6B8E70] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-xs text-red-400 hover:text-red-600 transition"
        >
          Remove image
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

// Audio file upload
function AudioField({ field, value, onChange, onPresignUpload }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      if (onPresignUpload) {
        const url = await onPresignUpload(file, field.key, "audio");
        onChange(url);
      } else {
        onChange(URL.createObjectURL(file));
      }
    } catch (err) {
      console.error("Audio upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2" id={`field-${field.key}`}>
      {value ? (
        <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3">
          <svg className="h-4 w-4 text-[#6B8E70] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
          </svg>
          <span className="text-xs text-zinc-600 flex-1 truncate">Audio file selected</span>
          <button type="button" onClick={() => onChange(null)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 bg-zinc-50 hover:bg-zinc-100 border border-dashed border-zinc-200 hover:border-[#6B8E70] text-zinc-500 hover:text-[#6B8E70] rounded-xl px-4 py-3 text-xs font-medium transition-colors duration-200 disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Upload music file (MP3, M4A, OGG)"}
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="audio/mpeg,audio/mp4,audio/ogg,audio/wav"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

// ─── FieldRenderer ─────────────────────────────────────────────────────────
/**
 * Generic field renderer driven by a single field definition from template.field_schema.
 *
 * Props:
 *   field           {object}  — field definition from field_schema.fields[]
 *   value           {any}     — current value from the content state
 *   onChange        {fn}      — (newValue) => void
 *   onPresignUpload {fn}      — optional: async (file, fieldKey, type) => publicUrl
 *                               wires image/audio fields to DO Spaces presign flow
 */
export default function FieldRenderer({ field, value, onChange, onPresignUpload }) {
  const renderInput = () => {
    switch (field.type) {
      case "text":          return <TextField field={field} value={value} onChange={onChange} />;
      case "textarea":      return <TextareaField field={field} value={value} onChange={onChange} />;
      case "date":          return <DateField field={field} value={value} onChange={onChange} />;
      case "time":          return <TimeField field={field} value={value} onChange={onChange} />;
      case "toggle":        return <ToggleField field={field} value={value} onChange={onChange} />;
      case "select":        return <SelectField field={field} value={value} onChange={onChange} />;
      case "color":         return <ColorField field={field} value={value} onChange={onChange} />;
      case "image":
      case "image_gallery": return <ImageField field={field} value={value} onChange={onChange} onPresignUpload={onPresignUpload} />;
      case "audio":         return <AudioField field={field} value={value} onChange={onChange} onPresignUpload={onPresignUpload} />;
      default:
        return (
          <p className="text-xs text-zinc-400 italic">
            Unknown field type: <code className="bg-zinc-100 px-1 rounded font-mono">{field.type}</code>
          </p>
        );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <label htmlFor={`field-${field.key}`} className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
          {field.label}
        </label>
        {field.required && (
          <span className="text-[#6B8E70] text-xs font-bold">*</span>
        )}
      </div>
      {renderInput()}
    </div>
  );
}
