export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-center">
      <h1 className="text-2xl font-bold" style={{ color: "var(--brand-primary)" }}>
        الأكاديمية غير موجودة
      </h1>
      <p className="text-sm text-muted-foreground">
        تحقق من الرابط أو تواصل مع مزايا للمساعدة.
      </p>
    </div>
  );
}
