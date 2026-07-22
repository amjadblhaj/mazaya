import { ExcelUpload } from "@/components/points/ExcelUpload";

export default function ExcelPage() {
  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-bold" style={{ color: "var(--brand-primary)" }}>
        استيراد Excel
      </h1>
      <ExcelUpload />
    </div>
  );
}
