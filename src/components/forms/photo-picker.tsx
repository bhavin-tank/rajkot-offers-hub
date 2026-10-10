"use client";

import { LoaderCircle, TriangleAlert, Upload, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

const MAX_PHOTOS = 5;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp";

interface Photo {
  id: string;
  preview: string;
  status: "uploading" | "done" | "failed";
  mediaId?: string;
}

interface UploadTicket {
  mediaId: string;
  uploadUrl: string;
  headers: Record<string, string>;
}

/** Reserves an upload with our API, then sends the file straight to storage. Returns the media id. */
async function upload(file: File): Promise<string> {
  const response = await fetch("/api/v1/public/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mime: file.type, bytes: file.size }),
  });
  if (!response.ok) throw new Error(`Upload request failed (${response.status})`);
  const { data } = (await response.json()) as { data: UploadTicket };
  const put = await fetch(data.uploadUrl, { method: "PUT", headers: data.headers, body: file });
  if (!put.ok) throw new Error(`Upload failed (${put.status})`);
  return data.mediaId;
}

/**
 * Dropzone with removable thumbnails. Each photo uploads as soon as it is
 * added; the form submits only the uploaded photos' ids (`mediaIds`).
 */
export function PhotoPicker({ error: fieldError }: { error?: string }) {
  const t = useT();
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Free object URLs on unmount.
  const latest = useRef(photos);
  useEffect(() => {
    latest.current = photos;
  }, [photos]);
  useEffect(() => () => latest.current.forEach((p) => URL.revokeObjectURL(p.preview)), []);

  function update(photoId: string, patch: Partial<Photo>) {
    setPhotos((current) => current.map((p) => (p.id === photoId ? { ...p, ...patch } : p)));
  }

  function add(files: FileList | null) {
    if (!files) return;
    const all = [...files];
    const images = all.filter((f) => ACCEPT.split(",").includes(f.type) && f.size <= MAX_BYTES);
    const room = MAX_PHOTOS - photos.length;
    setError(
      images.length > room
        ? t("You can add up to {max} photos", { max: MAX_PHOTOS })
        : all.some((f) => f.size > MAX_BYTES)
          ? t("Each photo must be 5 MB or smaller")
          : images.length < all.length
            ? t("JPG, PNG or WebP photos only")
            : null,
    );
    const added = images.slice(0, Math.max(room, 0)).map((file) => ({
      file,
      photo: { id: `${file.name}-${file.lastModified}-${Math.random()}`, preview: URL.createObjectURL(file), status: "uploading" as const },
    }));
    setPhotos((current) => [...current, ...added.map((a) => a.photo)]);
    for (const { file, photo } of added) {
      upload(file).then(
        (mediaId) => update(photo.id, { status: "done", mediaId }),
        () => update(photo.id, { status: "failed" }),
      );
    }
    if (input.current) input.current.value = "";
  }

  function remove(photo: Photo) {
    URL.revokeObjectURL(photo.preview);
    setPhotos((current) => current.filter((p) => p.id !== photo.id));
    setError(null);
  }

  const shown = error ?? fieldError;

  return (
    <div className="flex flex-col gap-3">
      <span id={`${id}-label`} className="text-sm font-medium">
        {t("Photos")}
      </span>
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          add(e.dataTransfer.files);
        }}
        className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-[1.5px] border-dashed border-line-strong bg-surface-2 px-4 py-6 text-center transition-colors hover:border-primary has-[:focus-visible]:border-primary"
      >
        <Upload size={26} className="text-primary" aria-hidden />
        <span className="text-sm font-medium">{t("Add the offer poster or shop photos")}</span>
        <span className="text-xs text-muted">{t("Up to 5 photos · JPG, PNG, WebP · 5 MB each")}</span>
        <input
          ref={input}
          type="file"
          accept={ACCEPT}
          multiple
          aria-labelledby={`${id}-label`}
          className="sr-only"
          onChange={(e) => add(e.target.files)}
        />
      </label>
      {shown && (
        <p id="photos-error" className="text-[13px] text-danger">
          {shown}
        </p>
      )}
      {photos.length > 0 && (
        <ul className="flex flex-wrap gap-2.5">
          {photos.map((photo, i) => (
            <li key={photo.id} className="relative size-[88px] overflow-hidden rounded-xl bg-surface">
              {/* Local object URL preview; next/image cannot optimise blob: URLs. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.preview}
                alt={t("Photo {n}", { n: i + 1 })}
                className={cn("size-full object-cover", photo.status !== "done" && "opacity-50")}
              />
              {photo.status !== "done" && (
                <span className="absolute inset-0 flex items-center justify-center" role="status">
                  {photo.status === "uploading" ? (
                    <LoaderCircle size={22} className="animate-spin text-ink" aria-label={t("Uploading…")} />
                  ) : (
                    <TriangleAlert size={22} className="text-danger" aria-label={t("Upload failed")} />
                  )}
                </span>
              )}
              <button
                type="button"
                aria-label={t("Remove photo {n}", { n: i + 1 })}
                onClick={() => remove(photo)}
                className="absolute top-1.5 right-1.5 flex size-[22px] cursor-pointer items-center justify-center rounded-full bg-ink/80 text-white"
              >
                <X size={13} strokeWidth={2.5} aria-hidden />
              </button>
              {photo.mediaId && <input type="hidden" name="mediaIds" value={photo.mediaId} />}
            </li>
          ))}
        </ul>
      )}
      <input type="hidden" name="photosUploading" value={String(photos.some((p) => p.status === "uploading"))} />
      <input type="hidden" name="photosFailed" value={String(photos.some((p) => p.status === "failed"))} />
    </div>
  );
}
