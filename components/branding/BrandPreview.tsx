"use client";

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;
const safe = (v: string, fallback: string) => (HEX_COLOR.test(v) ? v : fallback);

export function BrandPreview({
  academyName,
  primary,
  secondary,
  accent,
  logoPreview,
}: {
  academyName: string;
  primary: string;
  secondary: string;
  accent: string;
  logoPreview: string | null;
}) {
  const p = safe(primary, "#170C79");
  const s = safe(secondary, "#EFE3CA");
  const a = safe(accent, "#56B6C6");

  return (
    <div className="overflow-hidden rounded-xl border shadow-sm">
      <div className="flex h-64" style={{ background: p }}>
        <div className="flex w-2/5 flex-col gap-3 p-4">
          {logoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoPreview} alt="" className="h-8 w-auto" />
          ) : (
            <span className="truncate text-sm font-black" style={{ color: s }}>
              {academyName || "اسم الأكاديمية"}
            </span>
          )}
          <div className="mt-2 flex flex-col gap-2">
            <div className="rounded px-2 py-1.5 text-xs" style={{ background: a, color: p }}>
              لوحة التحكم
            </div>
            <div className="rounded px-2 py-1.5 text-xs" style={{ color: s, opacity: 0.6 }}>
              الطلاب
            </div>
            <div className="rounded px-2 py-1.5 text-xs" style={{ color: s, opacity: 0.6 }}>
              المكافآت
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-white/5 p-4">
          <button
            type="button"
            className="rounded-lg px-4 py-2 text-sm font-semibold"
            style={{ background: a, color: p }}
          >
            زر أساسي
          </button>
          <div className="h-2 w-32 overflow-hidden rounded-full bg-black/20">
            <div className="h-full w-2/3" style={{ background: a }} />
          </div>
        </div>
      </div>
    </div>
  );
}
