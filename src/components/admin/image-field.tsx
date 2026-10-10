"use client";

import { ImagePlus, LoaderCircle, X } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useFieldError } from "./action-form";
import { inputClass } from "./ui";
import { uploadAdminImage } from "./upload";

type Purpose = Parameters<typeof uploadAdminImage>[1];

/**
 * Photos as a list of URLs: upload new ones or paste links. Submits one hidden
 * value per line (`name`), first photo first.
 */
export function ImageListField({ name, label, defaultValue, max, purpose }: { name: string; label: string; defaultValue: string[]; max: number; purpose: Purpose }) {
  const [urls, setUrls] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [link, setLink] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const error = useFieldError(name);

  async function add(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setProblem(null);
    try {
      const room = max - urls.length;
      for (const file of [...files].slice(0, room)) {
        const url = await uploadAdminImage(file, purpose);
        setUrls((current) => [...current, url]);
      }
    } catch (e) {
      setProblem(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  function move(index: number, by: number) {
    setUrls((current) => {
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(index + by, 0, item);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      <textarea name={name} value={urls.join("\n")} readOnly hidden />
      <ul className="flex flex-wrap gap-2">
        {urls.map((url, i) => (
          <li key={`${url}-${i}`} className="group relative size-24 overflow-hidden rounded-lg border border-line bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="size-full object-cover" />
            {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-ink/80 px-1.5 text-[10px] text-white">Main</span>}
            <div className="absolute top-1 right-1 flex gap-1">
              {i > 0 && (
                <button type="button" onClick={() => move(i, -1)} className="flex size-6 cursor-pointer items-center justify-center rounded-full bg-white/90 text-xs" aria-label="Move earlier">
                  ←
                </button>
              )}
              <button type="button" onClick={() => setUrls((c) => c.filter((_, j) => j !== i))} className="flex size-6 cursor-pointer items-center justify-center rounded-full bg-ink/80 text-white" aria-label="Remove photo">
                <X size={12} />
              </button>
            </div>
          </li>
        ))}
        {urls.length < max && (
          <li>
            <label className={cn("flex size-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line-strong text-xs text-muted hover:border-primary", busy && "cursor-wait")}>
              {busy ? <LoaderCircle size={20} className="animate-spin" /> : <ImagePlus size={20} />}
              {busy ? "Uploading" : "Upload"}
              <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" disabled={busy} onChange={(e) => add(e.target.files)} />
            </label>
          </li>
        )}
      </ul>
      {urls.length < max && (
        <div className="flex max-w-lg gap-2">
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="…or paste an image link (https://…)" className={inputClass} />
          <button
            type="button"
            className="h-10 shrink-0 cursor-pointer rounded-lg border border-line-strong px-3 text-sm hover:bg-surface"
            onClick={() => {
              if (link.trim()) setUrls((c) => [...c, link.trim()]);
              setLink("");
            }}
          >
            Add link
          </button>
        </div>
      )}
      <p className="text-xs text-muted">Up to {max} · JPG, PNG or WebP, 5 MB each. The first photo is the main one.</p>
      {(problem || error) && <p className="text-xs text-danger">{problem ?? error}</p>}
    </div>
  );
}
