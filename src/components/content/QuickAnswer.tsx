export function QuickAnswer({ children }: { children: string }) {
  return (
    <div className="light-surface rounded-xl border border-blue-200 bg-blue-50/80 px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">
        Quick answer
      </p>
      <p className="mt-2 text-sm leading-relaxed text-slate-800">{children}</p>
    </div>
  );
}
