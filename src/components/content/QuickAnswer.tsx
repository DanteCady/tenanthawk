export function QuickAnswer({ children }: { children: string }) {
  return (
    <div className="light-surface rounded-xl border border-mk-amber-line bg-mk-amber-wash px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-mk-amber-deep">
        Quick answer
      </p>
      <p className="mt-2 text-sm leading-relaxed text-mk-ink2">{children}</p>
    </div>
  );
}
