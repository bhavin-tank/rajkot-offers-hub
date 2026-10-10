"use client";

import { Upload, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

const MAX_PHOTOS = 5;
const ACCEPT = "image/jpeg,image/png";

interface Photo {
  id: string;
  url: string;
}

/**
 * Dropzone with removable thumbnails. Photos stay in the browser for now
 * (there is no upload backend yet); only the count is submitted.
 */
export function PhotoPicker({ name = "photoCount" }: { name?: string }) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Free object URLs on unmount.
  const latest = useRef(photos);
  useEffect(() => {
    latest.current = photos;
  }, [photos]);
  useEffect(() => () => latest.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  function add(files: FileList | null) {
    if (!files) return;
    const images = [...files].filter((f) => ACCEPT.includes(f.type));
    const room = MAX_PHOTOS - photos.length;
    setError(images.length > room ? `વધુમાં વધુ ${MAX_PHOTOS} ફોટા ઉમેરી શકાય` : images.length < files.length ? "ફક્ત JPG અથવા PNG ફોટા" : null);
    const next = images.slice(0, Math.max(room, 0)).map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      url: URL.createObjectURL(file),
    }));
    setPhotos((current) => [...current, ...next]);
    if (input.current) input.current.value = "";
  }

  function remove(photo: Photo) {
    URL.revokeObjectURL(photo.url);
    setPhotos((current) => current.filter((p) => p.id !== photo.id));
    setError(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <span id={`${id}-label`} className="text-sm font-medium">
        ફોટા
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
        <span className="text-sm font-medium">ઓફર પોસ્ટર અથવા દુકાનના ફોટા ઉમેરો</span>
        <span className="text-xs text-muted">વધુમાં વધુ 5 ફોટા · JPG, PNG</span>
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
      {error && <p className="text-[13px] text-danger">{error}</p>}
      {photos.length > 0 && (
        <ul className="flex flex-wrap gap-2.5">
          {photos.map((photo, i) => (
            <li key={photo.id} className="relative size-[88px] overflow-hidden rounded-xl bg-surface">
              {/* Local object URL preview; next/image cannot optimise blob: URLs. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={`ફોટો ${i + 1}`} className="size-full object-cover" />
              <button
                type="button"
                aria-label={`ફોટો ${i + 1} દૂર કરો`}
                onClick={() => remove(photo)}
                className="absolute top-1.5 right-1.5 flex size-[22px] cursor-pointer items-center justify-center rounded-full bg-ink/80 text-white"
              >
                <X size={13} strokeWidth={2.5} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      <input type="hidden" name={name} value={photos.length} />
    </div>
  );
}
