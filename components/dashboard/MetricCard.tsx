import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function MetricCard({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold" style={{ color: "var(--brand-primary)" }}>
            {value.toLocaleString("ar")}
          </p>
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ background: "var(--brand-surface)" }}
        >
          <Icon className="size-5" style={{ color: "var(--brand-accent)" }} />
        </div>
      </CardContent>
    </Card>
  );
}
