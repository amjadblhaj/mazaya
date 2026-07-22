"use client";

import { Label } from "@/components/ui/label";

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

export function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={HEX_COLOR.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 cursor-pointer rounded border"
          aria-label={label}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#170C79"
          maxLength={7}
          className="w-28 rounded-md border px-2 py-2 text-sm font-mono uppercase"
        />
      </div>
    </div>
  );
}
