export function PointsHero({
  points,
  nextRewardPoints,
  nextRewardName,
}: {
  points: number;
  nextRewardPoints: number | null;
  nextRewardName: string | null;
}) {
  const progress = nextRewardPoints ? Math.min(100, (points / nextRewardPoints) * 100) : 100;

  return (
    <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
      <span className="text-sm" style={{ color: "var(--brand-secondary)", opacity: 0.7 }}>
        رصيد نقاطك
      </span>
      <span className="text-6xl font-black" style={{ color: "var(--brand-secondary)" }}>
        {points}
      </span>

      {nextRewardPoints && nextRewardName && (
        <div className="w-full max-w-xs">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, background: "var(--brand-accent)" }}
            />
          </div>
          <p className="mt-2 text-xs" style={{ color: "var(--brand-secondary)", opacity: 0.7 }}>
            {points} / {nextRewardPoints} للحصول على &quot;{nextRewardName}&quot;
          </p>
        </div>
      )}
    </div>
  );
}
