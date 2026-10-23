"use client";

import { ImagePlus, LoaderCircle, Star, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";

const MAX_MB = 6;

type Props = {
  name: string;
  initial: string[];
  multiple?: boolean;
  folder: "produits" | "collections";
  /** "json" : tableau JSON dans un seul champ ; "single" : l'URL seule */
  format?: "json" | "single";
};

/** Téléverse les images dans le bucket Supabase « images » et expose leurs URL publiques au formulaire. */
export function ImageUploader({ name, initial, multiple = true, folder, format = "json" }: Props) {
  const [images, setImages] = useState<string[]>(initial);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList | File[]) => {
    setError("");
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    const tooBig = list.find((f) => f.size > MAX_MB * 1024 * 1024);
    if (tooBig) {
      setError(`« ${tooBig.name} » dépasse ${MAX_MB} Mo. Compressez l'image puis réessayez.`);
      return;
    }
    const supabase = createClient();
    const selected = multiple ? list : list.slice(0, 1);
    setUploading(selected.length);
    const urls: string[] = [];
    for (const file of selected) {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("images").upload(path, file, { cacheControl: "31536000", contentType: file.type });
      if (upErr) {
        setError(`Échec du téléversement : ${upErr.message}`);
        continue;
      }
      urls.push(supabase.storage.from("images").getPublicUrl(path).data.publicUrl);
      setUploading((n) => n - 1);
    }
    setUploading(0);
    setImages((prev) => (multiple ? [...prev, ...urls] : urls.slice(0, 1).concat(urls.length ? [] : prev)));
  };

  const addUrl = () => {
    const v = url.trim();
    if (!/^https?:\/\//.test(v)) {
      setError("L'adresse de l'image doit commencer par https://");
      return;
    }
    setImages((prev) => (multiple ? [...prev, v] : [v]));
    setUrl("");
    setError("");
  };

  const makeMain = (i: number) => setImages((prev) => [prev[i], ...prev.filter((_, j) => j !== i)]);
  const removeAt = (i: number) => setImages((prev) => prev.filter((_, j) => j !== i));

  return (
    <div>
      <input type="hidden" name={name} value={format === "json" ? JSON.stringify(images) : (images[0] ?? "")} />

      {images.length > 0 && (
        <ul className={cn("mb-4 grid gap-3", multiple ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-1 sm:max-w-xs")}>
          {images.map((src, i) => (
            <li key={src + i} className="group relative aspect-square overflow-hidden rounded-md border border-sable bg-[#F6F1EB]">
              <Image src={src} alt="" fill sizes="200px" className="object-cover mix-blend-multiply" />
              {multiple && i === 0 && (
                <span className="absolute left-2 top-2 rounded bg-prune-900 px-2 py-0.5 text-[10px] uppercase tracking-wider text-or-200">Principale</span>
              )}
              <div className="absolute right-1.5 top-1.5 flex gap-1">
                {multiple && i > 0 && (
                  <button
                    type="button"
                    onClick={() => makeMain(i)}
                    aria-label="Définir comme image principale"
                    title="Définir comme image principale"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/95 text-or-700 shadow hover:bg-white"
                  >
                    <Star className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  aria-label="Retirer l'image"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/95 text-prune-700 shadow hover:bg-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          upload(e.dataTransfer.files);
        }}
        disabled={uploading > 0}
        className={cn(
          "flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-8 text-center transition-colors",
          dragging ? "border-or-500 bg-or-50" : "border-sable bg-ivoire hover:border-or-400"
        )}
      >
        {uploading > 0 ? <LoaderCircle className="h-6 w-6 animate-spin text-or-600" /> : <ImagePlus className="h-6 w-6 text-or-600" strokeWidth={1.4} />}
        <span className="text-[13px] text-encre">{uploading > 0 ? "Téléversement en cours…" : multiple ? "Cliquez ou déposez vos images ici" : "Cliquez ou déposez une image ici"}</span>
        <span className="text-[12px] text-taupe">JPG, PNG ou WebP — {MAX_MB} Mo max. Format carré conseillé.</span>
      </button>
      <input ref={input} type="file" accept="image/*" multiple={multiple} className="hidden" onChange={(e) => e.target.files && upload(e.target.files)} />

      <div className="mt-3 flex gap-2">
        <label htmlFor={`${name}-url`} className="sr-only">
          Ajouter une image par URL
        </label>
        <input
          id={`${name}-url`}
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addUrl();
            }
          }}
          placeholder="…ou collez l'URL d'une image"
          className="field min-h-[44px] rounded-md text-[14px]"
        />
        <button type="button" onClick={addUrl} className="min-h-[44px] shrink-0 cursor-pointer rounded-md border border-sable px-4 text-[12px] uppercase tracking-[0.12em] text-prune-900 hover:border-prune-900">
          Ajouter
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-[13px] text-prune-600">
          {error}
        </p>
      )}
    </div>
  );
}
