export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-slate-800/60 border border-slate-700/50"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-64 rounded-xl bg-slate-800/60 border border-slate-700/50" />
        <div className="h-64 rounded-xl bg-slate-800/60 border border-slate-700/50" />
      </div>

      <div className="rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="h-12 bg-slate-800/80" />
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-14 border-t border-slate-800/60"
            style={{ opacity: 1 - i * 0.1 }}
          >
            <div className="flex items-center gap-4 px-4 h-full">
              <div className="w-6 h-3 bg-slate-800 rounded" />
              <div className="w-32 h-3 bg-slate-800 rounded" />
              <div className="flex-1" />
              <div className="w-20 h-3 bg-slate-800 rounded" />
              <div className="w-20 h-3 bg-slate-800 rounded" />
              <div className="w-24 h-3 bg-slate-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
