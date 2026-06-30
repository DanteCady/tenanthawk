/** Intrinsic pixels (2× CSS display size at max-w-5xl). */
const SRC_WIDTH = 2048;
const SRC_HEIGHT = 1264;

export function HeroDashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-5xl">
      <div className="pointer-events-none absolute -inset-x-4 -inset-y-6 -z-10 rounded-[2rem] bg-gradient-to-b from-blue-100/60 via-slate-100/40 to-transparent blur-2xl" />

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_24px_80px_-24px_rgba(15,23,42,0.28)] ring-1 ring-slate-900/[0.04]">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-2 truncate rounded-md bg-white px-3 py-0.5 text-[11px] text-slate-400 ring-1 ring-slate-200">
            tenanthawk.io/dashboard
          </span>
        </div>

        {/* Native img + srcSet avoids next/image downscaling a 1x asset on retina. */}
        <img
          src="/marketing/hero-dashboard@2x.png"
          srcSet="/marketing/hero-dashboard.png 1024w, /marketing/hero-dashboard@2x.png 2048w"
          sizes="(max-width: 640px) 100vw, 1024px"
          alt="Tenant Hawk client overview showing health score, open issues, recoverable spend, and category grades"
          width={SRC_WIDTH}
          height={SRC_HEIGHT}
          className="block h-auto w-full"
          decoding="async"
          fetchPriority="high"
        />
      </div>
    </div>
  );
}
