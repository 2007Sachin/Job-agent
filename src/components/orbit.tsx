const stations = [
  { label: "Scout", x: 168, y: 28 },
  { label: "Tailor", x: 292, y: 118 },
  { label: "Relay", x: 168, y: 236 },
  { label: "Writer", x: 44, y: 118 },
];

export function Orbit() {
  return (
    <div className="glass relative mx-auto h-[320px] w-full max-w-[420px] overflow-hidden">
      <svg viewBox="0 0 360 280" className="h-full w-full" role="img" aria-label="Four bots circling one application">
        <circle cx="180" cy="140" r="92" fill="none" stroke="currentColor" strokeOpacity="0.25" />
        <circle cx="180" cy="140" r="58" fill="none" stroke="currentColor" strokeOpacity="0.18" />
        <g className="orbit" style={{ transformOrigin: "180px 140px" }}>
          {stations.map((s) => (
            <g key={s.label}>
              <circle cx={s.x} cy={s.y} r="16" fill="var(--paper)" stroke="currentColor" />
              <text x={s.x} y={s.y + 32} textAnchor="middle" fill="currentColor" fontSize="11">{s.label}</text>
            </g>
          ))}
        </g>
        <rect x="128" y="112" width="104" height="56" rx="4" fill="var(--brass)" />
        <text x="180" y="136" textAnchor="middle" fill="#14160f" fontSize="12">Application</text>
        <text x="180" y="152" textAnchor="middle" fill="#14160f" fontSize="10">waiting on you</text>
      </svg>
    </div>
  );
}
