export function Sparkline({
  points,
  width = 140,
  height = 40,
  className = "",
}: {
  points: number[];
  width?: number | string;
  height?: number;
  className?: string;
}) {
  if (points.length < 2) {
    return (
      <div
        className={`flex items-center justify-center text-xs text-slate-400 ${className}`}
        style={{ width, height }}
      >
        Not enough history yet
      </div>
    );
  }

  const min = Math.min(...points, 0);
  const max = Math.max(...points, 100);
  const range = max - min || 1;
  const numericWidth = typeof width === "number" ? width : 200;
  const stepX = numericWidth / (points.length - 1);

  const coords = points.map((p, i) => {
    const x = i * stepX;
    const y = height - ((p - min) / range) * height;
    return [x, y] as const;
  });

  const path = coords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const [lastX, lastY] = coords[coords.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${numericWidth} ${height}`}
      preserveAspectRatio="none"
      className={`overflow-visible ${className}`}
    >
      <path
        d={path}
        fill="none"
        stroke="#2563eb"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={lastX} cy={lastY} r="3" fill="#60a5fa" />
    </svg>
  );
}
