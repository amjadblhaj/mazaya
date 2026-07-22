import { GrantForm } from "@/components/points/GrantForm";

export default function GrantPage() {
  return (
    <div className="mx-auto max-w-md p-8">
      <h1 className="mb-6 text-2xl font-bold" style={{ color: "var(--brand-primary)" }}>
        منح النقاط
      </h1>
      <GrantForm />
    </div>
  );
}
