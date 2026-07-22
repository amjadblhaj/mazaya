"use client";

import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const MAX_SIZE = 2 * 1024 * 1024;
const VALID_TYPES = ["image/png", "image/jpeg"];

export function LogoUpload({ onChange }: { onChange: (file: File | null) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | null) {
    setError(null);
    if (!file) {
      setPreview(null);
      onChange(null);
      return;
    }
    if (!VALID_TYPES.includes(file.type)) {
      setError("PNG أو JPG فقط");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("الحجم الأقصى 2 ميجابايت");
      return;
    }
    setPreview(URL.createObjectURL(file));
    onChange(file);
  }

  return (
    <div className="flex flex-col gap-2">
      <Label>الشعار (اختياري)</Label>
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border bg-muted">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="معاينة الشعار" className="h-full w-full object-contain" />
          ) : (
            <span className="text-xs text-muted-foreground">لا يوجد</span>
          )}
        </div>
        <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
          اختر ملف
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
