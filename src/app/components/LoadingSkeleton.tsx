type LoadingSkeletonVariant =
  | "page"
  | "cards"
  | "rows"
  | "table"
  | "dashboard"
  | "detail";

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/70 ${className}`} />;
}

function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="h-11 w-11 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-3 w-2/3" />
          <SkeletonBlock className="h-2.5 w-1/3" />
        </div>
      </div>
      <div className="mt-5 space-y-3">
        <SkeletonBlock className="h-4 w-5/6" />
        <SkeletonBlock className="h-3 w-1/3" />
        <SkeletonBlock className="h-3 w-full" />
        <SkeletonBlock className="h-3 w-4/5" />
      </div>
      <SkeletonBlock className="mt-5 h-9 w-28 rounded-xl" />
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6">
      <SkeletonBlock className="h-3 w-24" />
      <SkeletonBlock className="mt-4 h-7 w-2/3 max-w-sm" />
      <SkeletonBlock className="mt-3 h-3 w-full max-w-xl" />
    </div>
  );
}

export default function LoadingSkeleton({
  variant = "page",
  count = 4,
  columns = 3,
  className = "",
}: {
  variant?: LoadingSkeletonVariant;
  count?: number;
  columns?: 2 | 3;
  className?: string;
}) {
  const cardGridColumns =
    columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div
      role="status"
      aria-label="Chargement du contenu"
      aria-busy="true"
      className={`space-y-5 ${className}`}
    >
      <span className="sr-only">Chargement en cours...</span>

      {variant === "page" && (
        <>
          <HeaderSkeleton />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: count }, (_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </>
      )}

      {variant === "cards" && (
        <div className={`grid gap-4 ${cardGridColumns}`}>
          {Array.from({ length: count }, (_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      )}

      {variant === "rows" && (
        <div className="space-y-4">
          {Array.from({ length: count }, (_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4"
            >
              <SkeletonBlock className="h-11 w-11 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonBlock className="h-3 w-2/3" />
                <SkeletonBlock className="h-3 w-full max-w-sm" />
              </div>
              <SkeletonBlock className="hidden h-8 w-20 shrink-0 rounded-lg sm:block" />
            </div>
          ))}
        </div>
      )}

      {variant === "table" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-5 flex gap-4 border-b border-slate-100 pb-4">
            {Array.from({ length: 5 }, (_, index) => (
              <SkeletonBlock key={index} className="h-3 flex-1" />
            ))}
          </div>
          <div className="space-y-5">
            {Array.from({ length: count }, (_, index) => (
              <div key={index} className="flex items-center gap-4">
                <SkeletonBlock className="h-9 w-9 shrink-0 rounded-full" />
                <SkeletonBlock className="h-3 flex-1" />
                <SkeletonBlock className="h-3 flex-1" />
                <SkeletonBlock className="h-3 flex-1" />
                <SkeletonBlock className="h-8 w-20 shrink-0 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      )}

      {variant === "dashboard" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="rounded-3xl border border-slate-100 bg-white p-5"
              >
                <SkeletonBlock className="h-10 w-10 rounded-xl" />
                <SkeletonBlock className="mt-5 h-3 w-2/3" />
                <SkeletonBlock className="mt-3 h-8 w-1/2" />
              </div>
            ))}
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-5 lg:col-span-2">
              <SkeletonBlock className="h-5 w-48" />
              <SkeletonBlock className="h-64 w-full rounded-2xl" />
            </div>
            <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-5">
              <SkeletonBlock className="h-5 w-40" />
              <SkeletonBlock className="mx-auto h-40 w-40 rounded-full" />
              <SkeletonBlock className="h-3 w-full" />
              <SkeletonBlock className="h-3 w-4/5" />
            </div>
          </div>
        </>
      )}

      {variant === "detail" && (
        <>
          <div className="rounded-3xl border border-slate-100 bg-white p-6">
            <div className="flex items-center gap-4">
              <SkeletonBlock className="h-16 w-16 shrink-0 rounded-full" />
              <div className="flex-1 space-y-3">
                <SkeletonBlock className="h-5 w-2/3 max-w-sm" />
                <SkeletonBlock className="h-3 w-1/3" />
              </div>
            </div>
            <SkeletonBlock className="mt-8 h-40 w-full rounded-2xl" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-100 bg-white p-5"
              >
                <SkeletonBlock className="h-3 w-1/3" />
                <SkeletonBlock className="mt-3 h-4 w-2/3" />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
